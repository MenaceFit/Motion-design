#!/usr/bin/env python3
"""Script → voix off + timings mot à mot (words.json), 100 % hors ligne.

Moteurs :
  pico   SVOX Pico (paquet apt libttspico-utils, licence Apache 2.0) — disponible ici, qualité
         « correcte » (voix de synthèse audible). Bon pour prototypes et format « texte + voix ».
  piper  Piper (voix neuronales, bien plus naturelles) — nécessite un modèle .onnx local
         (--piper-model), téléchargeable depuis huggingface.co quand l'accès réseau est ouvert.
         Vérifier la licence de chaque voix avant usage commercial.

Méthode de timing : chaque phrase est synthétisée séparément → bornes de phrase exactes ;
à l'intérieur d'une phrase, les mots sont répartis sur la zone voisée au prorata des syllabes
(voix sèche → précision ~±80 ms, suffisante pour de la kinetic typography).

Entrée : JSON [{"text": "...", "accents": ["MOT"], "emoji": {"MOT": "🧠"}}] ou texte brut.
Usage  : python3 tools/tts_voice.py script.json out_dir [--engine pico] [--speed 1.12] [--pitch 0]
Sortie : out_dir/voice.wav (48 kHz mono, traitée) + out_dir/words.json
"""
import argparse, json, os, re, subprocess, tempfile
import numpy as np
import soundfile as sf
from pedalboard import Pedalboard, HighpassFilter, Compressor, PeakFilter, HighShelfFilter, Gain, Limiter, NoiseGate

SR = 48000
VOWELS = r"[aeiouyàâäéèêëîïôöùûüœæ]+"


def syll(w):
    return max(1, len(re.findall(VOWELS, w.lower())))


def norm_word(w):
    return re.sub(r"[^\wÀ-ÿœæ'’-]", "", w).upper()


def synth_pico(text, path):
    subprocess.run(["pico2wave", "-l", "fr-FR", "-w", path, text], check=True)


def synth_piper(text, path, model):
    subprocess.run(["piper", "--model", model, "--output_file", path], input=text.encode(), check=True)


def load_resampled(path, speed, pitch):
    """Charge, change le tempo (sans changer la hauteur) et la hauteur via sox, rééchantillonne à 48 kHz."""
    out = path + ".proc.wav"
    cmd = ["sox", path, "-r", str(SR), "-c", "1", out]
    if pitch: cmd += ["pitch", str(pitch)]
    if abs(speed - 1) > 1e-3: cmd += ["tempo", "-s", str(speed)]
    subprocess.run(cmd, check=True)
    x, _ = sf.read(out)
    return x.astype(np.float32)


def trim(x, thr_db=-42):
    e = np.abs(x)
    win = int(0.01 * SR)
    env = np.convolve(e, np.ones(win) / win, mode="same")
    db = 20 * np.log10(env + 1e-9)
    idx = np.where(db > db.max() + thr_db)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - int(0.02 * SR)), min(len(x), idx[-1] + int(0.04 * SR))
    return x[a:b]


def voiced_spans(x, thr_db=-30):
    hop = int(0.005 * SR)
    frames = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    db = 20 * np.log10(rms)
    v = db > db.max() + thr_db
    t = np.arange(frames) * hop / SR
    return t, v


_WCACHE = {}


def word_weight(word, synth, speed, pitch, tmp):
    """Durée du mot prononcé seul (s) — bien plus fidèle que le nombre de syllabes
    (« strengths » vs « a » : même nombre de syllabes, durées très différentes)."""
    key = word.lower()
    if key not in _WCACHE:
        p = os.path.join(tmp, f"w{len(_WCACHE)}.wav")
        try:
            synth(word, p)
            _WCACHE[key] = max(0.05, len(trim(load_resampled(p, speed, pitch), -36)) / SR)
        except Exception:
            _WCACHE[key] = 0.08 * syll(word)
    return _WCACHE[key]


def place_words(words, x, offset, weights=None):
    """Répartit les mots d'une phrase sur sa zone voisée, au prorata de leur durée propre."""
    t, v = voiced_spans(x)
    vt = t[v]
    if not len(vt):
        vt = np.linspace(0, len(x) / SR, 10)
    # timeline voisée cumulée (on saute les pauses internes > 60 ms)
    w = np.array(weights if weights is not None else [syll(wd) for wd in words], float)
    cum = np.concatenate([[0], np.cumsum(w)]) / w.sum()
    idx = (cum * (len(vt) - 1)).round().astype(int)
    res = []
    for i, wd in enumerate(words):
        s = float(vt[idx[i]]); e = float(vt[max(idx[i], idx[i + 1] - 1)]) + 0.005
        res.append({"text": norm_word(wd), "start": round(offset + s, 3), "end": round(offset + max(e, s + 0.12), 3)})
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("out")
    ap.add_argument("--engine", default="pico", choices=["pico", "piper"])
    ap.add_argument("--piper-model"); ap.add_argument("--speed", type=float, default=1.12)
    ap.add_argument("--pitch", type=float, default=0, help="cents (ex. -150 pour une voix plus grave)")
    ap.add_argument("--gap", type=float, default=0.10, help="silence entre phrases (s)")
    ap.add_argument("--lead", type=float, default=0.15, help="silence au début (s)")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    raw = open(a.script, encoding="utf-8").read()
    try:
        lines = json.loads(raw)
    except json.JSONDecodeError:
        lines = [{"text": s} for s in re.split(r"(?<=[.!?…])\s+", raw.strip()) if s]

    chunks, words, t = [np.zeros(int(a.lead * SR), np.float32)], [], a.lead
    tmp = tempfile.mkdtemp()
    for li, line in enumerate(lines):
        p = os.path.join(tmp, f"l{li}.wav")
        (synth_pico if a.engine == "pico" else lambda tx, pa: synth_piper(tx, pa, a.piper_model))(line["text"], p)
        x = trim(load_resampled(p, a.speed, a.pitch))
        toks = [w for w in line["text"].split() if norm_word(w)]  # « ? », « — » seuls : pas de bloc vide
        synth = synth_pico if a.engine == "pico" else (lambda tx, pa: synth_piper(tx, pa, a.piper_model))
        wts = [word_weight(tk, synth, a.speed, a.pitch, tmp) for tk in toks]
        ws = place_words(toks, x, t, wts)
        for w, tk in zip(ws, toks):
            w["line"] = li; w["stop"] = tk[-1] in ".!?…,;:"  # ponctuation = frontière de bloc
        acc = {norm_word(m) for m in line.get("accents", [])}
        emo = {norm_word(k): v for k, v in line.get("emoji", {}).items()}
        for w in ws:
            w["accent"] = w["text"] in acc
            if w["text"] in emo: w["emoji"] = emo[w["text"]]
        words += ws
        chunks.append(x)
        pause = a.gap * (2.2 if line["text"].rstrip()[-1:] in ".!?…" else 1)
        chunks.append(np.zeros(int(pause * SR), np.float32))
        t += len(x) / SR + pause
    voice = np.concatenate(chunks)
    # chaîne voix « radio » : nettoyage, présence, compression, niveau constant
    board = Pedalboard([
        HighpassFilter(90), NoiseGate(threshold_db=-50, ratio=4),
        PeakFilter(cutoff_frequency_hz=250, gain_db=-2.5, q=1.0),     # retire la « boue »
        PeakFilter(cutoff_frequency_hz=3200, gain_db=3.0, q=0.9),     # présence/intelligibilité
        HighShelfFilter(cutoff_frequency_hz=9000, gain_db=2.0),        # air
        Compressor(threshold_db=-20, ratio=3.5, attack_ms=4, release_ms=90),
        Gain(4), Limiter(threshold_db=-2),
    ])
    voice = board(voice[None, :], SR)[0]
    sf.write(os.path.join(a.out, "voice.wav"), voice, SR, subtype="PCM_24")
    # regrouper les mots affichés trop peu de temps (< 0,17 s entre deux débuts) avec le suivant :
    # en dessous de ~10 frames à 60 fps, un mot n'est pas lisible
    merged = []
    for i, w in enumerate(words):
        nxt = words[i + 1]["start"] if i + 1 < len(words) else w["end"] + 1
        if merged and merged[-1].get("_short") and merged[-1]["line"] == w["line"] and not merged[-1]["stop"] and len(merged[-1]["text"]) + len(w["text"]) <= 18:
            m = merged[-1]
            m["text"] += " " + w["text"]; m["end"] = w["end"]
            m["accent"] = m.get("accent", False) or w.get("accent", False)
            if "emoji" in w: m["emoji"] = w["emoji"]
            m["stop"] = w["stop"]
            m["_short"] = (nxt - m["start"]) < 0.17 or len(m["text"]) <= 3
        else:
            # mots-outils (« LA », « UNE », « IL ») collés au mot suivant : « LA PEUR » se lit d'un bloc
            d = dict(w); d["_short"] = (nxt - w["start"]) < 0.17 or len(w["text"]) <= 3
            merged.append(d)
    for m in merged:
        for k in ("_short", "stop"): m.pop(k, None)  # « line » conservé : sert au calage des scènes
    for i in range(len(merged) - 1):  # le mot reste affiché jusqu'au suivant (pas d'écran vide)
        merged[i]["end"] = merged[i + 1]["start"]
    json.dump(merged, open(os.path.join(a.out, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"voix {len(voice) / SR:.2f}s · {len(merged)} blocs de mots → {a.out}")


if __name__ == "__main__":
    main()
