#!/usr/bin/env python3
"""Plan JSON → vidéo « Spotlight Noir » finie (voix, plans calés sur la voix, musique, SFX, mix, rendu, QC).

Style : references/visual-styles/spotlight-noir.md (principes tirés de ref09/ref10).
Composition Remotion : templates/remotion-kinetic/src/noir/NoirStage.tsx.

Plan :
{
  "slug": "attention-signal", "title": "Hook affiché en haut pendant toute la vidéo",
  "accent": "#ff2d6f", "fps": 60,
  "voice": {"engine": "pico", "speed": 1.05} | {"file": "voix.wav"},
  "music": {"mood": "tension", "bpm": 96, "seed": 3},
  "lines": [
    {"text": "Plus tu cours après son attention, plus elle t'échappe.", "accents": ["attention"],
     "shot": {"type": "spotlight", "in": "whip", "hud": "SUJET · TOI", "figures": [...], "lights": [...]}},
    {"text": "Ligne sans « shot » = le plan précédent continue."}
  ]
}
Dans un « shot », toute valeur texte "@MOT" (ou "@MOT+0.3") est remplacée par l'instant (s, relatif au début
du plan) où ce mot est prononcé → les animations tombent exactement sur la voix.
Clé « on »: "mot" → le plan démarre quand ce mot est prononcé (le début de la ligne reste sur le plan précédent).
Types de plans : spotlight, crowd, versus, gauge, heartbeat, chat, counter, keyword. Transitions (« in ») :
whip, zoom, glitch, flash, cut.

Usage : python3 tools/make_noir.py projects/<slug>/plan.json [--out renders/] [--preview] [--no-render]
"""
import argparse, json, os, re, shutil, subprocess, sys
import numpy as np
import soundfile as sf
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "remotion-kinetic"
TOOLS = ROOT / "tools"
CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
TR = {"whip": .3, "zoom": .36, "glitch": .34, "flash": .2, "cut": 0}  # = TR dans NoirStage.tsx


def run(cmd, **kw):
    print("  $", " ".join(str(c) for c in cmd)[:200], flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def norm(w):
    return re.sub(r"[^\wÀ-ÿœæ'’-]", "", w).upper()


def parts(text):
    """Mots d'un bloc, élisions séparées : « T'ÉCRIT » → [T, ÉCRIT] (pour retrouver « @écrit »)."""
    return [norm(p) for p in re.split(r"[\s'’]+", text) if norm(p)]


def resolve(obj, words, t0):
    """Remplace récursivement "@MOT[+/-d]" par le temps relatif du mot (premier mot qui commence par MOT)."""
    if isinstance(obj, dict): return {k: resolve(v, words, t0) for k, v in obj.items()}
    if isinstance(obj, list): return [resolve(v, words, t0) for v in obj]
    if isinstance(obj, str) and obj.startswith("@"):
        m = re.match(r"@([^+\-]+?)([+-][\d.]+)?$", obj)
        key = norm(m.group(1))
        for w in words:
            if any(p.startswith(key) for p in parts(w["text"])):
                return round(w["start"] - t0 + float(m.group(2) or 0), 3)
        print(f"  ! mot introuvable pour {obj} → 0.3 s"); return 0.3
    return obj


def sfx_plan(shots, words, sfx):
    """Chaque son a une fonction : transition, allumage, mesure qui monte, battement, message…"""
    S = lambda name, k: f"{sfx}/{name}_0{1 + k % 2}.wav"
    out = []
    add = lambda name, k, at, vol: out.append({"src": S(name, k), "at": round(max(0, at), 3), "volume": vol})
    impacts = []  # instants d'impact → creux musical juste avant (silence avant l'impact)
    for i, s in enumerate(shots):
        t0 = s["start"]; tr = s.get("in", "cut" if i else None)
        if tr == "whip": add("whip", i, t0 - .2, .55)
        if tr == "zoom": add("zoom_in", i, t0 - .45, .5); add("pop", i, t0, .2)
        if tr == "glitch": add("glitch", i, t0 - .17, .45)
        if tr == "flash": add("flash", i, t0, .55); add("sub_hit", i, t0, .5); impacts.append(t0)
        ty = s["type"]
        if ty == "keyword":
            add("neon_flicker", i, t0, .55); add("boom", i, t0 + .38, .62); impacts.append(t0 + .38)
            sub = s.get("sub", "")
            for k in range(0, len(sub), 3): add("typewriter", k, t0 + .42 + k / 60, .07)
        if ty == "counter":
            a, b = s.get("from", 0), s.get("to", 100); at, d = s.get("at", .2), s.get("dur", .9)
            n = min(14, abs(b - a))
            for k in range(n): add("tick", k, t0 + at + d * (k + .5) / n, .3)
            add("sub_hit", i, t0 + at + d, .35)
        if ty == "gauge":
            at, d = s.get("at", .25), s.get("dur", 1.1)
            for k in range(int(d / .07)): add("tick", k, t0 + at + k * .07, .16)
            add("blip_up", i, t0 + at + d, .3)
        if ty == "heartbeat":
            a, b = s.get("from", 70), s.get("to", 120); at, d = s.get("at", .3), s.get("dur", 1.6)
            eio = lambda x: 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2   # = eIO de NoirStage.tsx
            tt, ph, dt = 0.0, 0.67, 1 / 200  # pic R de l'ECG à la phase 0,33 → son au moment où la pointe dessine le pic
            while t0 + tt < s["end"]:
                f = a + (b - a) * eio(min(1, max(0, (tt - at) / d)))
                ph += f / 60 * dt; tt += dt
                if ph >= 1: ph -= 1; add("heartbeat", int(tt * 10), t0 + tt, .55)
        if ty == "chat":
            for k, m in enumerate(s.get("msgs", [])):
                add("pop" if m.get("from") != "her" else "blip_up", k, t0 + m.get("at", .4 + k * .45), .4)
            if s.get("seen"): add("click", i, t0 + s["seen"]["at"], .3)
            if s.get("leaveAt") is not None: add("whoosh_out", i, t0 + s["leaveAt"], .35)
        if ty == "versus":
            add("sub_hit", i, t0 + .05, .3)
            for k, r in enumerate(s.get("rows", [])): add("blip_up", k, t0 + r.get("at", .25 + k * .3), .22)
        if ty == "spotlight":
            for l in s.get("lights", []):
                if l.get("flickerAt") is not None: add("neon_flicker", i, t0 + l["flickerAt"], .3)
                if l.get("at") is not None and l.get("to") is not None: add("whoosh_in", i, t0 + l["at"] - .1, .25)
            for k, g in enumerate(s.get("tags", [])): add("pop", k, t0 + g["at"], .3)
            for k, f in enumerate(s.get("figures", [])):
                for m in f.get("moves", []):
                    if abs(m["to"] - f.get("x", 540)) > 150: add("swish", k, t0 + m["at"], .2)
        if ty == "crowd":
            if s.get("focusAt") is not None: add("zoom_in", i, t0 + s["focusAt"] - .4, .35); add("blip_up", i, t0 + s["focusAt"], .3)
            if s.get("leaveAt") is not None: add("whoosh_out", i, t0 + s["leaveAt"], .3)
    for k, w in enumerate(words):  # mots-clés du sous-titre : clic discret (le punch caméra est visuel)
        if w.get("accent"): add("click", k, w["start"] - 1 / 30, .22)
    return out, impacts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--out", default=str(ROOT / "renders"))
    ap.add_argument("--preview", action="store_true", help="30 fps")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--concurrency", type=int, default=4)
    a = ap.parse_args()
    plan = json.load(open(a.plan, encoding="utf-8"))
    slug = plan["slug"]; work = Path(a.out).resolve() / slug; work.mkdir(parents=True, exist_ok=True)
    fps = 30 if a.preview else plan.get("fps", 60)
    py = sys.executable
    lines = plan["lines"]

    # 1. Voix + mots horodatés
    voice = plan.get("voice") or {"engine": "pico"}
    script = [{k: l[k] for k in ("text", "accents", "pause", "audio_file") if k in l} for l in lines]
    json.dump(script, open(work / "script.json", "w", encoding="utf-8"), ensure_ascii=False)
    if voice.get("file"):
        shutil.copy(voice["file"], work / "voice.wav")
        (work / "script.txt").write_text(" ".join(l["text"] for l in lines), encoding="utf-8")
        run([py, TOOLS / "transcribe_words.py", work / "voice.wav", work / "words.json", "--upper", "--script", work / "script.txt"])
        words = json.load(open(work / "words.json", encoding="utf-8"))
        bounds = np.cumsum([len([x for x in l["text"].split() if norm(x)]) for l in lines])
        acc = {norm(x) for l in lines for x in l.get("accents", [])}
        for i, w in enumerate(words):
            w["line"] = int(np.searchsorted(bounds, i, side="right")); w["text"] = norm(w["text"]); w["accent"] = w["text"] in acc
    else:
        run([py, TOOLS / "tts_voice.py", work / "script.json", work, "--engine", voice.get("engine", "pico"),
             "--speed", voice.get("speed", 1.05), "--pitch", voice.get("pitch", 0), "--gap", voice.get("gap", .16), "--lead", .35])
        words = json.load(open(work / "words.json", encoding="utf-8"))
    duration = round(words[-1]["end"] + plan.get("tail", 1.6), 2)

    # 2. Plans calés sur la voix
    first = {}
    for w in words: first.setdefault(w["line"], w["start"])
    shots = []
    for li, l in enumerate(lines):
        if l.get("shot") and li in first:
            st = 0.0 if not shots else round(first[li] - .08, 3)
            if l["shot"].get("on"):  # le plan démarre sur un mot précis de la ligne (ex. carte mot-clé)
                key = norm(l["shot"]["on"])
                hit = next((w for w in words if w["line"] == li and any(x.startswith(key) for x in parts(w["text"]))), None)
                if hit: st = round(hit["start"] - .06, 3)
            shots.append({"_line": li, **l["shot"], "start": st})
    for k, s in enumerate(shots):
        s["end"] = shots[k + 1]["start"] if k + 1 < len(shots) else duration
        lw = [w for w in words if s["start"] - .01 <= w["start"] < s["end"]]
        li = s.pop("_line")
        shots[k] = resolve(s, lw, s["start"])
    json.dump(shots, open(work / "shots.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # 3. Musique (drop sur la première transition forte) + creux avant chaque impact
    mc = plan.get("music", {"mood": "tension", "bpm": 96, "seed": 1})
    drop = next((s["start"] for s in shots[1:] if s.get("in") in ("glitch", "flash", "zoom")), shots[1]["start"] if len(shots) > 1 else 2)
    run([py, TOOLS / "music_gen.py", work / "music.wav", "--mood", mc.get("mood", "tension"), "--bpm", mc.get("bpm", 96),
         "--duration", duration + .5, "--drop", round(drop, 3), "--seed", mc.get("seed", 1)])
    sfx_dir = work / "sfx"
    run([py, TOOLS / "sfx_synth.py", sfx_dir, "--variants", 2, "--seed", mc.get("seed", 1)])
    plan_sfx, impacts = sfx_plan(shots, words, sfx_dir)
    m, sr = sf.read(work / "music.wav", always_2d=True)
    g = np.ones(len(m))
    for t in impacts:  # « silence avant l'impact » mesuré sur ref09 (trou spectral juste avant RIEN.)
        i0, i1 = int((t - .32) * sr), int(t * sr)
        if i0 > 0 and i1 < len(g):
            ramp = np.concatenate([np.linspace(1, .12, int(.06 * sr)), np.full(i1 - i0 - int(.06 * sr), .12)])
            g[i0:i1] = np.minimum(g[i0:i1], ramp)
            back = min(len(g) - i1, int(.25 * sr)); g[i1:i1 + back] = np.minimum(g[i1:i1 + back], np.linspace(.12, 1, back))
    sf.write(work / "music.wav", m * g[:, None], sr)
    json.dump(plan_sfx, open(work / "sfx.json", "w"), indent=1)
    run([py, TOOLS / "mix_audio.py", work / "master.wav", "--voice", work / "voice.wav", "--music", work / "music.wav",
         "--sfx", work / "sfx.json", "--duration", duration, "--music-db", mc.get("db", -13)])

    # 4. Rendu
    pub = TPL / "public" / "projects" / slug; pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(work / "master.wav", pub / "master.wav")
    caps = [{k: w[k] for k in ("text", "start", "end", "line", "accent", "stop") if k in w} for w in words]
    props = {"title": plan.get("title"), "accent": plan.get("accent", "#d7ff1f"), "captions": caps, "shots": shots,
             "audio": f"projects/{slug}/master.wav", "duration": duration, "progressBar": plan.get("progressBar", True)}
    json.dump(props, open(work / "props.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if a.no_render:
        print("props :", work / "props.json"); return
    raw = work / "raw.mp4"
    env = dict(os.environ, CHROMIUM_PATH=CHROME)
    run(["npx", "remotion", "render", "src/index.ts", "NoirStage" if fps == 60 else "NoirStage30", raw, f"--props={work / 'props.json'}",
         "--crf=16", f"--concurrency={a.concurrency}", f"--browser-executable={CHROME}", "--log=error"], cwd=TPL, env=env)

    # 5. Finition + QC
    final = work / f"{slug}.mp4"
    run([TOOLS / "finish.sh", raw, final])
    json.dump([{"start": w["start"]} for w in words], open(work / "events.json", "w"))
    q = subprocess.run([str(x) for x in [py, TOOLS / "qc_check.py", final, "--fps", fps, "--events", work / "events.json"]], capture_output=True, text=True)
    (work / "qc.txt").write_text(q.stdout + q.stderr)
    print(q.stdout)
    print("✔ vidéo :", final)


if __name__ == "__main__":
    main()
