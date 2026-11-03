#!/usr/bin/env python3
"""Plan JSON → vidéo finale (voix, timings, musique, SFX, rendu 3D, finition, QC) en une commande.

Le plan est écrit par Claude à partir du prompt de l'utilisateur (voir skill prompt-to-video).
Schéma minimal :
{
  "slug": "cerveau-raccourcis",
  "theme": "neon",                       # neon | gold | ice | mono | fire | toxic (ou objet theme complet)
  "font": "montserrat",                  # montserrat | montserratUp | anton | archivo
  "entrance": "flip",                    # flip | slam | twist
  "fps": 60,                             # 60 = fluidité max (rendu ~2x plus long que 30)
  "voice": {"engine": "pico", "speed": 1.1, "pitch": 0} | {"file": "chemin/voix.wav"} | null,
  "music": {"mood": "hype", "bpm": 120, "seed": 4},
  "lines": [ {"text": "Ton cerveau adore les raccourcis.", "accents": ["cerveau"], "emoji": {"cerveau": "🧠"}} ]
}
voice = null → format « texte + musique » : les mots sont calés sur les temps de la musique.

Usage : python3 tools/make_video.py plan.json [--out renders/] [--preview] [--concurrency 4]
"""
import argparse, json, os, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "remotion-kinetic"
TOOLS = ROOT / "tools"
CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"

THEMES = {
    "neon":  {"bgTop": "#2a0b2e", "bgBottom": "#07020a", "face": "#f6f0ff", "side": "#5b2a86", "accentFace": "#ff2e55", "accentSide": "#2b0614", "light": "#ffd9a8", "particles": "#ffffff"},
    "gold":  {"bgTop": "#14100a", "bgBottom": "#000000", "face": "#ffd27a", "side": "#6b4410", "accentFace": "#ffffff", "accentSide": "#8a5a12", "light": "#ffe2b0", "particles": "#ffcf70", "glow": "#ffb347"},
    "ice":   {"bgTop": "#06213a", "bgBottom": "#01060d", "face": "#eaf8ff", "side": "#1d5f8c", "accentFace": "#39e6ff", "accentSide": "#063a52", "light": "#d6f3ff", "particles": "#9fe8ff"},
    "mono":  {"bgTop": "#151515", "bgBottom": "#000000", "face": "#ffffff", "side": "#3a3a3a", "accentFace": "#ffffff", "accentSide": "#7a7a7a", "light": "#ffffff", "particles": "#ffffff", "glow": "#ffffff"},
    "fire":  {"bgTop": "#2b0700", "bgBottom": "#070100", "face": "#fff1e0", "side": "#8a2a00", "accentFace": "#ff7a00", "accentSide": "#4a1200", "light": "#ffc58a", "particles": "#ffb070"},
    "toxic": {"bgTop": "#0c1f08", "bgBottom": "#020601", "face": "#f2ffe9", "side": "#2c5a12", "accentFace": "#b6ff3b", "accentSide": "#2a4a06", "light": "#eaffd0", "particles": "#c8ff7a"},
}

VOWELS = r"[aeiouyàâäéèêëîïôöùûüœæ]+"


def run(cmd, **kw):
    print("  $", " ".join(str(c) for c in cmd)[:220], flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def norm(w):
    return re.sub(r"[^\wÀ-ÿœæ'’-]", "", w).upper()


def words_on_beats(lines, bpm, lead_beats=1):
    """Format sans voix : 1 mot par demi-temps (+ selon syllabes), pause d'un temps entre phrases."""
    beat = 60 / bpm; half = beat / 2
    t = lead_beats * beat; out = []
    for ln in lines:
        acc = {norm(x) for x in ln.get("accents", [])}; emo = {norm(k): v for k, v in ln.get("emoji", {}).items()}
        for w in ln["text"].split():
            n = norm(w); syl = max(1, len(re.findall(VOWELS, w.lower())))
            d = half * (2 if syl >= 3 or n in acc else 1)
            out.append({"text": n, "start": round(t, 3), "end": round(t + d, 3), "accent": n in acc, **({"emoji": emo[n]} if n in emo else {})})
            t += d
        t += beat
    return out


def sfx_plan(words, sfx_dir, fps):
    """SFX par défaut pour le texte 3D : swish à chaque entrée, impact sur les accents, pop sur les emojis."""
    one = 1 / fps; plan = []
    for i, w in enumerate(words):
        at = max(0, w["start"] - one)
        plan.append({"src": f"{sfx_dir}/swish_0{1 + i % 3}.wav", "at": max(0, at - 0.05), "volume": 0.16})
        if w.get("accent"):
            plan.append({"src": f"{sfx_dir}/sub_hit_0{1 + i % 2}.wav", "at": at, "volume": 0.5})
        if w.get("emoji"):
            plan.append({"src": f"{sfx_dir}/pop_0{1 + i % 2}.wav", "at": at + 0.03, "volume": 0.35})
    return plan


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--out", default=str(ROOT / "renders"))
    ap.add_argument("--preview", action="store_true", help="30 fps, qualité brouillon (rapide)")
    ap.add_argument("--concurrency", type=int, default=1)  # mesuré : 1 tab = 1,5 s/frame, 4 tabs = 3,4 s/frame (SwiftShader sature les CPU)
    a = ap.parse_args()
    plan = json.load(open(a.plan, encoding="utf-8"))
    slug = plan["slug"]
    work = Path(a.out) / slug; work.mkdir(parents=True, exist_ok=True)
    fps = 30 if a.preview else plan.get("fps", 60)
    py = sys.executable

    # 1. Voix + timings
    lines = plan["lines"]
    json.dump(lines, open(work / "script.json", "w", encoding="utf-8"), ensure_ascii=False)
    music_cfg = plan.get("music", {"mood": "hype", "bpm": 120, "seed": 1})
    voice = plan.get("voice")
    if voice and voice.get("file"):
        # voix enregistrée par l'utilisateur : timings par alignement sur le script (voix sèche requise)
        shutil.copy(voice["file"], work / "voice.wav")
        (work / "script.txt").write_text(" ".join(l["text"] for l in lines), encoding="utf-8")
        tw = [py, TOOLS / "transcribe_words.py", work / "voice.wav", work / "words.json", "--upper"]
        tw += ["--model", voice["whisper_model"]] if voice.get("whisper_model") else ["--script", work / "script.txt"]
        run(tw)
        words = json.load(open(work / "words.json", encoding="utf-8"))
        acc = {norm(x) for l in lines for x in l.get("accents", [])}
        emo = {norm(k): v for l in lines for k, v in l.get("emoji", {}).items()}
        for w in words:
            w["text"] = norm(w["text"]); w["accent"] = w["text"] in acc
            if w["text"] in emo: w["emoji"] = emo[w["text"]]
    elif voice:
        run([py, TOOLS / "tts_voice.py", work / "script.json", work, "--engine", voice.get("engine", "pico"),
             "--speed", voice.get("speed", 1.1), "--pitch", voice.get("pitch", 0)])
        words = json.load(open(work / "words.json", encoding="utf-8"))
    else:
        words = words_on_beats(lines, music_cfg.get("bpm", 120))
        json.dump(words, open(work / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    words[-1]["end"] = max(words[-1]["end"], words[-1]["start"] + 1.1)  # punchline finale tenue à l'écran
    json.dump(words, open(work / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    duration = words[-1]["end"] + 0.6

    # 2. Musique (drop calé sur le premier mot accentué = premier impact)
    first_acc = next((w["start"] for w in words if w.get("accent")), words[0]["start"])
    run([py, TOOLS / "music_gen.py", work / "music.wav", "--mood", music_cfg.get("mood", "hype"), "--bpm", music_cfg.get("bpm", 120),
         "--duration", round(duration + 0.5, 2), "--drop", round(first_acc, 3), "--seed", music_cfg.get("seed", 1)])

    # 3. SFX + mix
    sfx_dir = work / "sfx"
    run([py, TOOLS / "sfx_synth.py", sfx_dir, "--variants", 3, "--seed", music_cfg.get("seed", 1), "--only", "swish", "sub_hit", "pop", "whoosh_in"])
    json.dump(sfx_plan(words, sfx_dir, fps), open(work / "sfx.json", "w"), indent=1)
    mix = [py, TOOLS / "mix_audio.py", work / "master.wav", "--music", work / "music.wav", "--sfx", work / "sfx.json", "--duration", round(duration, 2)]
    if voice: mix += ["--voice", work / "voice.wav"]
    else: mix += ["--music-db", "-8"]
    run(mix)

    # 4. Rendu Remotion (texte 3D)
    pub = TPL / "public" / "projects" / slug; pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(work / "master.wav", pub / "master.wav")
    theme = plan.get("theme", "neon")
    props = {"words": words, "font": plan.get("font", "montserrat"), "entrance": plan.get("entrance", "flip"),
             "theme": THEMES[theme] if isinstance(theme, str) else theme, "voice": f"projects/{slug}/master.wav",
             "progressBar": plan.get("progressBar", True), "shake": plan.get("shake", 1),
             "quality": "draft" if a.preview else "final"}
    json.dump(props, open(work / "props.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    raw = work / "raw.mp4"
    env = dict(os.environ, CHROMIUM_PATH=CHROME)
    comp = "Text3D" if fps == 60 else "Text3D30"
    run(["npx", "remotion", "render", "src/index.ts", comp, raw, f"--props={work / 'props.json'}", "--crf=16",
         f"--concurrency={a.concurrency}", "--log=error"], cwd=TPL, env=env)

    # 5. Finition + QC
    final = work / f"{slug}.mp4"
    run([TOOLS / "finish.sh", raw, final])
    json.dump([{"start": w["start"]} for w in words], open(work / "events.json", "w"))
    q = subprocess.run([str(x) for x in [py, TOOLS / "qc_check.py", final, "--fps", fps, "--events", work / "events.json"]], capture_output=True, text=True)
    (work / "qc.txt").write_text(q.stdout)
    print(q.stdout)
    print("✔ vidéo :", final)


if __name__ == "__main__":
    main()
