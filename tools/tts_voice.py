#!/usr/bin/env python3
"""Script → voix off + timings mot à mot (words.json), 100 % hors ligne.

Moteurs :
  elevenlabs  voix neuronales ElevenLabs (API, clé ELEVENLABS_API_KEY, hôte api.elevenlabs.io autorisé).
         Une voix par personnage (champ « voice » de chaque ligne), timings exacts par caractère
         (endpoint /with-timestamps), continuité de prosodie (previous_text / next_text).
         Repli automatique sur pico si la clé ou le réseau manquent (rapport dans voice_report.json).
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


_EL_OK = None


def elevenlabs_available():
    """Clé présente + API joignable (testé une fois)."""
    global _EL_OK
    if _EL_OK is None:
        key = os.environ.get("ELEVENLABS_API_KEY")
        _EL_OK = False
        if key:
            import urllib.request, ssl
            try:
                req = urllib.request.Request("https://api.elevenlabs.io/v1/user", headers={"xi-api-key": key})
                urllib.request.urlopen(req, timeout=15, context=_ssl_ctx())
                _EL_OK = True
            except Exception as e:
                print("ElevenLabs indisponible :", str(e)[:120])
    return _EL_OK


def _ssl_ctx():
    import ssl
    ca = "/root/.ccr/ca-bundle.crt"
    return ssl.create_default_context(cafile=ca) if os.path.exists(ca) else ssl.create_default_context()


TAG = re.compile(r"\[[^\]]*\]")


def synth_elevenlabs(text, path, v, prev_text=None, next_text=None):
    """Synthèse ElevenLabs avec horodatage par caractère. Retourne l'alignement (chars, starts, ends)."""
    import urllib.request, base64
    body = {"text": text, "model_id": v.get("model", "eleven_multilingual_v2"),
            "voice_settings": {"stability": v.get("stability", 0.4), "similarity_boost": v.get("similarity", 0.8),
                               "style": v.get("style", 0.35), "use_speaker_boost": True, "speed": v.get("speed", 1.0)}}
    if v.get("language"): body["language_code"] = v["language"]
    v3 = "v3" in body["model_id"]
    if not v3:  # eleven_v3 : intonation par balises audio ; continuité previous/next réservée aux modèles v2
        if prev_text: body["previous_text"] = TAG.sub("", prev_text)
        if next_text: body["next_text"] = TAG.sub("", next_text)
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120, context=_ssl_ctx()) as r:
        res = json.loads(r.read())
    mp3 = path + ".mp3"
    open(mp3, "wb").write(base64.b64decode(res["audio_base64"]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), path], check=True)
    al = res.get("alignment") or res.get("normalized_alignment")
    if not al:
        return None
    return al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]


def words_from_alignment(text, chars, starts, ends, offset, trim_s):
    """Timings mot à mot exacts à partir de l'alignement par caractère (balises [..] ignorées)."""
    out, cur, cs, ce = [], "", None, None
    in_tag = False
    for ch, a, b in zip(chars, starts, ends):
        if ch == "[": in_tag = True
        if in_tag:
            if ch == "]": in_tag = False
            continue
        if ch.isspace():
            if cur: out.append((cur, cs, ce)); cur, cs = "", None
            continue
        if cs is None: cs = a
        cur += ch; ce = b
    if cur: out.append((cur, cs, ce))
    res = []
    for w, a, b in out:
        if not norm_word(w): continue
        res.append({"text": norm_word(w), "start": round(offset + max(0, a - trim_s), 3), "end": round(offset + max(0, b - trim_s), 3), "raw": w})
    return res


def load_resampled(path, speed, pitch):
    """Charge, change le tempo (sans changer la hauteur) et la hauteur via sox, rééchantillonne à 48 kHz."""
    out = path + ".proc.wav"
    cmd = ["sox", path, "-r", str(SR), "-c", "1", out]
    if pitch: cmd += ["pitch", str(pitch)]
    if abs(speed - 1) > 1e-3: cmd += ["tempo", "-s", str(speed)]
    subprocess.run(cmd, check=True)
    x, _ = sf.read(out)
    return x.astype(np.float32)


def trim_with_offset(x, thr_db=-42):
    e = np.abs(x)
    win = int(0.01 * SR)
    env = np.convolve(e, np.ones(win) / win, mode="same")
    db = 20 * np.log10(env + 1e-9)
    idx = np.where(db > db.max() + thr_db)[0]
    if not len(idx): return x, 0.0
    a, b = max(0, idx[0] - int(0.02 * SR)), min(len(x), idx[-1] + int(0.04 * SR))
    return x[a:b], a / SR


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
    ap.add_argument("--engine", default="pico", choices=["pico", "piper", "elevenlabs"])
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
    report = []
    for li, line in enumerate(lines):
        p = os.path.join(tmp, f"l{li}.wav")
        v = line.get("voice") or {}
        eng = v.get("engine", a.engine)
        if eng == "elevenlabs" and not elevenlabs_available():
            eng = "pico"; v = v.get("fallback", {})        # repli hors ligne (voix du personnage approchée)
        toks = [w for w in line["text"].split() if norm_word(w)]  # « ? », « — » seuls : pas de bloc vide
        if eng == "elevenlabs":
            spoken = line.get("tts_text", line["text"])            # texte dit (balises d'intonation)
            prev_t = lines[li - 1].get("tts_text", lines[li - 1]["text"]) if li else None
            next_t = lines[li + 1].get("tts_text", lines[li + 1]["text"]) if li + 1 < len(lines) else None
            if "v3" not in v.get("model", "eleven_multilingual_v2"):
                spoken = TAG.sub("", spoken).strip()          # les balises ne sont comprises que par eleven_v3
            try:
                al = synth_elevenlabs(spoken, p, v, prev_t, next_t)
            except Exception as e:                              # voix invalide, quota… → repli hors ligne pour cette ligne
                print(f"ligne {li} : ElevenLabs en erreur ({str(e)[:100]}) → repli hors ligne")
                eng = "pico"; v = v.get("fallback", {})
        if eng == "elevenlabs":
            x0, _ = sf.read(p); x0 = x0.astype(np.float32)
            x, trim_s = trim_with_offset(x0)
            if al:
                ws = words_from_alignment(spoken, *al, t, trim_s)
                # recaler sur les mots du texte affiché (même ordre, balises retirées)
                if len(ws) != len(toks):
                    ws = place_words(toks, x, t, [syll(w) for w in toks])
            else:
                ws = place_words(toks, x, t, [syll(w) for w in toks])
            for w, tk in zip(ws, toks):
                w["text"] = norm_word(tk); w["line"] = li; w["stop"] = tk[-1] in ".!?…,;:"; w.pop("raw", None)
            report.append({"line": li, "engine": "elevenlabs", "voice_id": v.get("voice_id"), "model": v.get("model")})
        if eng != "elevenlabs":
            sp, pt = v.get("speed", line.get("speed", a.speed)), v.get("pitch", line.get("pitch", a.pitch))
            (synth_pico if eng == "pico" else lambda tx, pa: synth_piper(tx, pa, a.piper_model))(line["text"], p)
            x = trim(load_resampled(p, sp, pt))
            synth = synth_pico if eng == "pico" else (lambda tx, pa: synth_piper(tx, pa, a.piper_model))
            wts = [word_weight(tk, synth, sp, pt, tmp) for tk in toks]
            ws = place_words(toks, x, t, wts)
            for w, tk in zip(ws, toks):
                w["line"] = li; w["stop"] = tk[-1] in ".!?…,;:"  # ponctuation = frontière de bloc
            report.append({"line": li, "engine": eng})
        acc = {norm_word(m) for m in line.get("accents", [])}
        emo = {norm_word(k): v for k, v in line.get("emoji", {}).items()}
        for w in ws:
            w["accent"] = w["text"] in acc
            if w["text"] in emo: w["emoji"] = emo[w["text"]]
        words += ws
        chunks.append(x)
        pause = line.get("pause", a.gap * (2.2 if line["text"].rstrip()[-1:] in ".!?…" else 1))  # pause propre à la ligne (mise en scène)
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
    json.dump(report, open(os.path.join(a.out, "voice_report.json"), "w"), indent=1)
    used = sorted({r["engine"] for r in report})
    print("moteur(s) de voix utilisé(s) :", ", ".join(used))
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
