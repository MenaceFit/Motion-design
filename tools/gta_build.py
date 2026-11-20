#!/usr/bin/env python3
"""plan.json → vidéo « GTA Guide » finie (voix, sous-titres, footage réel recadré, overlays, SFX, musique, mix, QC).

Schéma du plan (projects/<slug>/plan.json) :
{
  "slug": "gta6-code-argent",
  "channel": "@tonpseudo",                    # bug de chaîne en haut à droite (optionnel)
  "credit": "Images : Rockstar Games",         # mention de source (recommandé)
  "voice": {"engine": "piper", "model": "footage/models/piper/fr_FR-siwis-medium.onnx", "length_scale": 0.88}
           | {"file": "chemin/voix.wav"},      # voix enregistrée par l'utilisateur (prioritaire si fournie)
  "music": {"mood": "hype", "bpm": 128, "seed": 3, "db": -17},
  "sources": [{"claim": "…", "urls": ["…", "…"]}],   # ≥ 2 sources par fait (règle : ne rien inventer)
  "default_tags": ["vice_city", "voiture"],    # repli si une ligne ne trouve pas de plan
  "lines": [
    {"text": "Voici le code pour avoir 250 000 $ sur GTA 6.",   # texte affiché ({…} = groupe insécable)
     "say": "Voici le code pour avoir deux cent cinquante mille dollars sur GTA 6.",  # texte prononcé (optionnel)
     "accents": ["250 000 $"],                 # mots affichés seuls, en jaune, avec punch
     "shots": ["LT-012"], "tags": ["argent", "lucia"],      # plans imposés puis recherche par tags
     "overlay": {"type": "counter", "value": 250000, "at": "250"},   # ou liste ; at = mot d'ancrage
     "transition": "zoom" | "whip" | "cut",    # transition d'entrée de la ligne (défaut : alternance)
     "pause": 0.12}                            # silence après la ligne (s)
  ]
}

Usage : python3 tools/gta_build.py projects/<slug>/plan.json [--preview] [--concurrency 3] [--no-render]
Sorties : renders/<slug>/<slug>.mp4 + qc.txt + edit.json + sources.md
"""
import argparse, json, os, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
TPL = ROOT / "templates" / "remotion-kinetic"
IDX = ROOT / "footage" / "index"
CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
FPS, SR = 30, 48000
SMALL = set("le la les l' de du des d' un une à au aux et ou sur pour tu te t' ton ta tes ce ces cet cette il y a en "
            "ne n' pas que qu' qui avec dans par se s' son sa ses mon ma mes je j' on est c' ça si mais puis".split())
LIB = TPL / "public" / "sfxlib"


def run(cmd, **kw):
    cmd = [str(c) for c in cmd]
    r = subprocess.run(cmd, **kw)
    if r.returncode:
        sys.exit(f"échec : {' '.join(cmd[:4])}…")
    return r


# ---------------------------------------------------------------- voix
def synth_line(text, out, voice):
    eng = voice.get("engine", "piper")
    tmp = out.with_suffix(".raw.wav")
    if eng == "piper":
        run([sys.executable, "-m", "piper", "-m", ROOT / voice["model"], "-f", tmp, "--length-scale", voice.get("length_scale", 0.9),
             "--sentence-silence", "0"], input=text.encode(), capture_output=True)
    else:  # pico
        run(["pico2wave", "-l", "fr-FR", "-w", tmp, text])
    import librosa
    y, sr = librosa.load(tmp, sr=SR)
    y, _ = librosa.effects.trim(y, top_db=38)
    sf.write(out, y, SR); tmp.unlink()
    return len(y) / SR


def process_voice(y):
    from pedalboard import Pedalboard, HighpassFilter, Compressor, PeakFilter, HighShelfFilter, Gain, Limiter
    board = Pedalboard([HighpassFilter(85), PeakFilter(220, -2.0, 1.0), PeakFilter(3200, 3.0, 0.9), HighShelfFilter(9000, 2.0),
                        Compressor(threshold_db=-20, ratio=3.2, attack_ms=4, release_ms=90), Gain(4), Limiter(-1.5)])
    return board(y.astype(np.float32)[None, :], SR)[0]


_WHISPER = {}


def whisper_words(wav):
    from faster_whisper import WhisperModel
    import librosa
    if "m" not in _WHISPER:
        _WHISPER["m"] = WhisperModel("small", device="cpu", compute_type="int8")
    y, _ = librosa.load(wav, sr=16000)
    segs, _ = _WHISPER["m"].transcribe(y, language="fr", word_timestamps=True, vad_filter=False)
    return [{"text": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in s.words]


# ---------------------------------------------------------------- texte → jetons → sous-titres
def tokenize(text):
    """Jetons affichés. {…} = groupe forcé ; nombres « 250 000 $ » / « 11.000$ » = un jeton."""
    toks = []
    for m in re.finditer(r"\{([^}]*)\}|\d[\d   .,]*\d\s?[$€%]?|\d[$€%]?|\S+", text):
        tok = m.group(1) if m.group(1) is not None else m.group(0)
        if toks and re.fullmatch(r"[!?:;.,…»]+", tok):  # « mot ! » / « mot : » (typo française) → ponctuation rattachée
            toks[-1] += tok
        else:
            toks.append(tok)
    return toks


def norm(s):
    return re.sub(r"[^0-9a-zàâäéèêëîïôöùûüçœ]", "", s.lower())


def align(tokens, words, t0, t1):
    """Temps de début de chaque jeton affiché, par interpolation sur la position en caractères des mots Whisper."""
    if not words:
        n = sum(max(1, len(norm(t))) for t in tokens); acc = 0; out = []
        for t in tokens:
            out.append(t0 + (t1 - t0) * acc / n); acc += max(1, len(norm(t)))
        return out
    wc = [max(1, len(norm(w["text"]))) for w in words]
    cum = np.concatenate([[0], np.cumsum(wc)]) / sum(wc)
    times = np.concatenate([[words[0]["start"]], [w["end"] for w in words]])
    # temps de début de chaque mot whisper → points (fraction, temps)
    xs = np.concatenate([[cum[i] for i in range(len(words))], [1.0]])
    ts = np.concatenate([[w["start"] for w in words], [words[-1]["end"]]])
    tc = [max(1, len(norm(t))) for t in tokens]
    tcum = np.concatenate([[0], np.cumsum(tc)])[:-1] / sum(tc)
    return [float(np.interp(f, xs, ts)) for f in tcum]


def clean(tok):
    t = re.sub(r"^[«\"'(]+|[»\"'),.;:…]+$", "", tok).strip()
    return re.sub(r"(?<=\w)!$", " !", t)  # garde « ! » (ton), espace fine française


def group_captions(tokens, starts, line_end, accents):
    acc = [a.lower() for a in accents]
    caps, cur = [], []

    def flush():
        if cur:
            caps.append({"text": " ".join(clean(t) for t, _ in cur).upper(), "start": cur[0][1],
                         "accent": any(clean(t).lower() in acc for t, _ in cur)})
            cur.clear()

    for i, (t, s) in enumerate(zip(tokens, starts)):
        c = clean(t)
        if not c:
            continue
        is_acc = c.lower() in acc
        if is_acc:  # mot-clé seul… sauf petits mots qui le précèdent (« les 91 missions »)
            if not all(clean(x).lower() in SMALL for x, _ in cur):
                flush()
            cur.append((t, s)); flush(); continue
        cur.append((t, s))
        n_chars = sum(len(clean(x)) for x, _ in cur)
        punct = bool(re.search(r"[,.;:!?…]$", t))
        nxt_acc = i + 1 < len(tokens) and clean(tokens[i + 1]).lower() in acc
        small = c.lower() in SMALL or c.lower().endswith("'")
        if nxt_acc and not punct and all(clean(x).lower() in SMALL for x, _ in cur):
            pass  # rattaché au mot-clé suivant
        elif punct or nxt_acc or (not small and (len(cur) >= 3 or n_chars >= 11)) or len(cur) >= 4:
            flush()
    flush()
    for k, c in enumerate(caps):
        c["end"] = caps[k + 1]["start"] if k + 1 < len(caps) else line_end
    # fusion des sous-titres trop courts (< 0,22 s) avec le suivant (sauf accents)
    out = []
    for c in caps:
        if out and (out[-1]["end"] - out[-1]["start"] < 0.22) and not out[-1]["accent"] and not c["accent"]:
            out[-1]["text"] += " " + c["text"]; out[-1]["end"] = c["end"]
        else:
            out.append(c)
    return out


# ---------------------------------------------------------------- footage
def load_footage():
    idx = json.loads((IDX / "index.json").read_text())["items"]
    tp = ROOT / "references" / "gta-footage-tags.json"
    tags = json.loads(tp.read_text()) if tp.exists() else {}
    return {it["id"]: it for it in idx}, tags


def pick(items, tags, want, need, used, prefer_kind=None):
    best, bs = None, -1e9
    want = [w.lower() for w in want]
    for id_, it in items.items():
        t = tags.get(id_, {})
        if id_ in used or t.get("avoid") or t.get("q", 1) < 1:
            continue
        have = set(x.lower() for x in t.get("tags", []) + it.get("auto_tags", []))
        hit = sum(1 for w in want if any(w in h for h in have))
        if want and not hit:
            continue
        s = hit * 10 + t.get("q", 1) * 4
        if it["kind"] == "shot":
            r = t.get("range", [0, 1])
            usable = it["dur"] * (r[1] - r[0]) - 0.14
            s += 3 if usable >= need else (-30 if usable < need * 0.7 else -8)
            s += min(it.get("motion", 2), 6) * 0.4
        else:
            s -= 2  # une capture fixe (Ken Burns) vaut un peu moins qu'un plan vidéo
        if prefer_kind and it["kind"] == prefer_kind:
            s += 2
        if s > bs:
            best, bs = id_, s
    return best


def clip_spec(it, need, out, head, tail, rng=None):
    """rng = portion utilisable du plan en fractions [a, b] (tags « range » : fondus enchaînés, textes)."""
    if rng and it["kind"] == "shot":
        d = it["dur"]; it = dict(it, start=it["start"] + rng[0] * d, dur=(rng[1] - rng[0]) * d)
    if it["kind"] == "still":
        return {"src": str(ROOT / it["src"]), "dur": need, "focus": it["focus"], "zoom": [1.0, 1.13], "head": head, "tail": tail, "out": str(out)}
    usable = it["dur"] - 0.14
    speed = 1.0 if usable >= need else max(0.72, usable / need)
    span = need * speed
    if usable > 2 * span:  # plan long : fenêtre centrée sur l'image médiane (celle qui a été taguée)
        start = it["start"] + it["dur"] / 2 - span / 2
    else:
        start = it["start"] + 0.07 + max(0.0, (usable - span) / 2) * 0.5  # léger décalage vers le début (l'action commence tôt)
    return {"src": str(ROOT / it["src"]), "start": round(start, 3), "dur": need, "speed": round(speed, 3), "focus": it["focus"],
            "head": head, "tail": tail, "out": str(out)}


# ---------------------------------------------------------------- SFX
def sfx(name):
    p = LIB / (name + ".wav")
    return str(p) if p.exists() else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--preview", action="store_true"); ap.add_argument("--concurrency", type=int, default=3)
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    plan = json.loads(Path(a.plan).read_text())
    slug = plan["slug"]
    work = ROOT / "renders" / slug; work.mkdir(parents=True, exist_ok=True)
    pub = TPL / "public" / "projects" / slug; (pub / "clips").mkdir(parents=True, exist_ok=True)
    lines = plan["lines"]
    voice = plan.get("voice", {"engine": "piper", "model": "footage/models/piper/fr_FR-siwis-medium.onnx"})

    # 0. sources (règle : chaque fait a ≥ 2 sources)
    src_md = ["# Sources des faits\n"]
    for s in plan.get("sources", []):
        src_md.append(f"- {s['claim']}\n" + "".join(f"  - {u}\n" for u in s["urls"]))
        if len(s["urls"]) < 2:
            print(f"⚠ un seul source pour : {s['claim']}")
    (work / "sources.md").write_text("".join(src_md))

    # 1. voix ligne par ligne + timings
    print("1/6 voix + timings")
    lead = 0.05; t = lead; spans = []; chunks = []
    for i, ln in enumerate(lines):
        if "file" in voice:
            sys.exit("voix fichier : découper la prise en lignes dans renders/<slug>/voice/<i>.wav (voir skill gta-guide-video)")
        p = work / f"line{i:02d}.wav"
        d = synth_line(ln.get("say", ln["text"]), p, voice)
        y, _ = sf.read(p)
        words = [dict(w, start=w["start"] + t, end=w["end"] + t) for w in whisper_words(str(p))]
        spans.append({"start": t, "end": t + d, "words": words})
        chunks.append(y); gap = ln.get("pause", 0.12)
        chunks.append(np.zeros(int(gap * SR))); t += d + gap
    tail = plan.get("tail", 0.7)
    total = t + tail
    v = np.concatenate([np.zeros(int(lead * SR))] + chunks + [np.zeros(int(tail * SR))])
    sf.write(work / "voice.wav", process_voice(v), SR)

    # 2. sous-titres
    print("2/6 sous-titres")
    caps = []
    for i, (ln, sp) in enumerate(zip(lines, spans)):
        toks = tokenize(ln["text"])
        st = align(toks, sp["words"], sp["start"], sp["end"])
        line_end = spans[i + 1]["start"] if i + 1 < len(spans) else total
        for c in group_captions(toks, st, line_end, ln.get("accents", [])):
            c["line"] = i; caps.append(c)
        sp["tokens"] = list(zip(toks, st))

    # 3. montage : créneaux de plans calés sur les sous-titres (~1,5 s)
    print("3/6 choix des plans")
    items, tags = load_footage()
    used, slots = set(), []
    styles = ["zoom", "whip"]; k_tr = 0
    for i, ln in enumerate(lines):
        lc = [c for c in caps if c["line"] == i]
        bounds = [lc[0]["start"] if i else 0.0]
        acc = 0.0
        for c in lc[1:]:
            if c["start"] - bounds[-1] >= ln.get("shot_len", 1.45):
                bounds.append(c["start"])
        end = spans[i + 1]["start"] if i + 1 < len(spans) else total
        if end - bounds[-1] < 0.6 and len(bounds) > 1:
            bounds.pop()
        bounds.append(end)
        forced = list(ln.get("shots", []))
        tr = ln.get("transition") or (styles[k_tr % 2] if i else "zoom"); k_tr += 1
        for j in range(len(bounds) - 1):
            need = bounds[j + 1] - bounds[j]
            id_ = None
            while forced and not id_:
                f = forced.pop(0)
                if f in items and f not in used: id_ = f
            if not id_:
                id_ = pick(items, tags, ln.get("tags", []), need, used) or pick(items, tags, plan.get("default_tags", []), need, used) \
                      or pick(items, tags, [], need, used)
            used.add(id_)
            slots.append({"id": id_, "start": bounds[j], "end": bounds[j + 1], "line": i, "enter": tr if j == 0 else "cut"})

    # transitions cuites : queue du plan précédent + tête du plan suivant
    specs = []
    for k, s in enumerate(slots):
        head = "zoom" if k == 0 else {"zoom": "zoom", "whip": "whip_r", "cut": "none"}[s["enter"]]
        nxt = slots[k + 1]["enter"] if k + 1 < len(slots) else "cut"
        tail_ = {"zoom": "zoom", "whip": "whip_l", "cut": "none"}[nxt]
        s["clip"] = f"clips/c{k:02d}.mp4"
        specs.append(clip_spec(items[s["id"]], round(s["end"] - s["start"] + 1 / FPS, 3), pub / s["clip"], head, tail_,
                               tags.get(s["id"], {}).get("range")))
    (work / "clips.json").write_text(json.dumps(specs, indent=1))
    print("   plans :", " ".join(s["id"] for s in slots))
    run([sys.executable, TOOLS / "clip_cut.py", "--spec", work / "clips.json", "--jobs", 3])

    # 4. overlays + fx + SFX
    print("4/6 overlays, effets, SFX")
    fr = lambda x: int(round(x * FPS))
    overlays, fx, sfxs = [], [], []
    for s in slots:
        if s["enter"] in ("zoom", "whip") and s["start"] > 0:
            sfxs.append({"src": sfx("zzfx/swoosh"), "at": s["start"] - 0.14, "volume": 0.5})
    sfxs.append({"src": sfx("zzfx/swoosh"), "at": 0.0, "volume": 0.45})
    for c in caps:
        if c["accent"]:
            fx.append({"type": "punch", "at": fr(c["start"]), "dur": 8, "amount": 0.07})
            sfxs.append({"src": sfx("zzfx/impact"), "at": c["start"], "volume": 0.32})
    for i, ln in enumerate(lines):
        ovs = ln.get("overlay") or []
        ovs = [ovs] if isinstance(ovs, dict) else ovs
        sp = spans[i]; line_end = spans[i + 1]["start"] if i + 1 < len(spans) else total
        for o in ovs:
            o = dict(o)
            at = sp["start"]
            if o.get("at"):
                for tok, st in sp["tokens"]:
                    if o["at"].lower() in tok.lower(): at = st; break
            o.pop("at", None)
            until = o.pop("until", None)
            end = total if until == "end" else (at + until if isinstance(until, (int, float)) else line_end)
            if o["type"] == "combo" and "times" not in o:
                dirs = {"haut": "U", "bas": "D", "gauche": "L", "droite": "R"}
                ts = [st for tok, st in sp["tokens"] if norm(tok) in dirs]
                o["times"] = [max(0, fr(x - at)) for x in ts[:len(o["keys"])]]
                for x in ts[:len(o["keys"])]:
                    sfxs.append({"src": sfx("jsfxr/click_1"), "at": x, "volume": 0.38})
            o["from"], o["to"] = fr(at), fr(end)
            overlays.append(o)
            T = o["type"]
            if T == "counter":
                for q in range(9): sfxs.append({"src": sfx("zzfx/tick"), "at": at + 0.07 + q * 0.085, "volume": 0.28})
                sfxs.append({"src": sfx("jsfxr/pickupCoin_2"), "at": at + 0.88, "volume": 0.3})
                fx.append({"type": "flash", "at": fr(at + 0.86), "dur": 7, "amount": 0.35})
            elif T == "alert":
                sfxs.append({"src": sfx("uisfx/cinematic/error"), "at": at, "volume": 0.5}); fx.append({"type": "shake", "at": fr(at), "dur": 9, "amount": 16})
            elif T == "step":
                sfxs.append({"src": sfx("uisfx/cinematic/forward"), "at": at, "volume": 0.45})
            elif T == "card":
                for r in range(len(o.get("rows", []))): sfxs.append({"src": sfx("uisfx/cinematic/progress-step"), "at": at + 0.2 + r * 0.17, "volume": 0.35})
            elif T == "code":
                for q in range(len(o["code"])): sfxs.append({"src": sfx("jsfxr/click_2"), "at": at + (6 + q * 7) / FPS, "volume": 0.38})
            elif T == "pin":
                sfxs.append({"src": sfx("zzfx/impact"), "at": at + 0.2, "volume": 0.4})
            elif T == "subscribe":
                sfxs.append({"src": sfx("uisfx/cinematic/press"), "at": at + 22 / FPS, "volume": 0.55})
                sfxs.append({"src": sfx("uisfx/cinematic/complete"), "at": at + 25 / FPS, "volume": 0.4})
            elif T in ("title", "flow"):
                sfxs.append({"src": sfx("zzfx/pop"), "at": at, "volume": 0.35})
    sfxs = [s for s in sfxs if s["src"] and s["at"] >= 0]
    (work / "sfx.json").write_text(json.dumps(sfxs, indent=1))

    # 5. musique + mix
    print("5/6 musique + mix")
    m = plan.get("music", {})
    run([sys.executable, TOOLS / "music_gen.py", work / "music.wav", "--mood", m.get("mood", "hype"), "--bpm", m.get("bpm", 128),
         "--duration", round(total + 0.5, 2), "--drop", m.get("drop", 0.3), "--seed", m.get("seed", 3)], capture_output=True)
    run([sys.executable, TOOLS / "mix_audio.py", work / "master.wav", "--voice", work / "voice.wav", "--music", work / "music.wav",
         "--sfx", work / "sfx.json", "--duration", round(total, 2), "--music-db", m.get("db", -17)], capture_output=True)

    # 6. rendu
    edit = {"durationInFrames": fr(total), "channel": plan.get("channel"), "credit": plan.get("credit", "Images : Rockstar Games"),
            "accent": plan.get("accent"),
            "clips": [{"src": f"projects/{slug}/{s['clip']}", "from": fr(s["start"]), "dur": fr(s["end"]) - fr(s["start"]) + 1,
                       "punch": [1.0, 1.05]} for s in slots],
            "fx": fx,
            "captions": [{"text": c["text"], "from": max(0, fr(c["start"]) - 1), "to": max(1, fr(c["end"]) - 1),  # avance 1 f (QC : médiane -39 ms) "accent": c["accent"],
                          "mono": bool(re.fullmatch(r"(?:[LR][123BT]|[LR]STICK|\d{3,6}|(?:\d ){2,7}\d)", c["text"]))} for c in caps],
            "overlays": overlays}
    edit = {k: v for k, v in edit.items() if v is not None}
    (work / "edit.json").write_text(json.dumps(edit, indent=1, ensure_ascii=False))
    json.dump([{"start": c["start"]} for c in caps], open(work / "events.json", "w"))
    if a.no_render:
        print("edit.json prêt :", work / "edit.json"); return
    print("6/6 rendu Remotion + finition + QC")
    env = dict(os.environ, CHROMIUM_PATH=CHROME)
    raw = work / "raw.mp4"
    run(["npx", "remotion", "render", "src/index.ts", "GtaGuide", raw, f"--props={work / 'edit.json'}", "--crf=16", "--muted",
         f"--concurrency={a.concurrency}", "--log=error"] + (["--scale=0.5"] if a.preview else []), cwd=TPL, env=env)
    mux = work / "mux.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", work / "master.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "pcm_s16le", "-shortest", mux.with_suffix(".mov")])
    final = work / f"{slug}.mp4"
    run([TOOLS / "finish.sh", mux.with_suffix(".mov"), final])
    q = subprocess.run([sys.executable, str(TOOLS / "qc_check.py"), str(final), "--fps", str(FPS), "--events", str(work / "events.json")]
                       + (["--target", "540x960"] if a.preview else []), capture_output=True, text=True)
    (work / "qc.txt").write_text(q.stdout)
    print(q.stdout[-1500:])
    print("→", final)


if __name__ == "__main__":
    main()
