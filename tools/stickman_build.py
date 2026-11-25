#!/usr/bin/env python3
"""Construit l'audio d'une vidéo « Stickman Spotlight » à partir de son plan JSON.

Le moteur d'animation (templates/remotion-kinetic/src/stickman/engine.ts) est exécuté tel quel par
Node pour obtenir les instants EXACTS où chaque pied touche le sol → les bruits de pas sont calés à
l'échantillon près sur l'image (pas de dérive entre l'animation et le son).

Timeline sonore (chaque son a une fonction) :
  - pas (sec / mouillé sous la pluie), volume selon l'allure, pied lointain un peu plus doux → incarne la marche ;
  - « light_on » à chaque scène → l'allumage en néon du projecteur ;
  - « shimmer » discret pendant que le décor se dessine point par point ;
  - « whoosh_out » léger sur la baisse de lumière de fin de scène → transition ;
  - « pop » doux sur chaque *mot clé* de légende → ponctue le mot ;
  - nappe de pluie sur les scènes pluvieuses (fondu d'entrée/sortie) → ambiance ;
  - musique lofi originale (tools/music_gen.py --mood lofi) sous le tout.
Sorties (--out) : events.json, sfx.json, music.wav, master.wav, props.json ; copie de master.wav
dans public/projects/<slug>/ pour le rendu Remotion.

Usage : python3 tools/stickman_build.py projects/<slug>/stick.json --out <dossier>
"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "remotion-kinetic"
PY = sys.executable
sys.path.insert(0, str(ROOT / "tools"))
import sfx_synth  # noqa: E402


def run(cmd, **kw):
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def caption_keyword_times(scene, start):
    """Même calcul que <Caption> (Atmosphere.tsx) : mot i révélé à start + 0.45 + i * per."""
    words = [w for w in scene.get("caption", "").split() if w]
    if not words: return []
    per = min(0.32, scene["duration"] * 0.55 / len(words))
    flags, on = [], False   # même règle que highlightFlags() : *un ou plusieurs mots*
    for w in words:
        s = bool(re.match(r'^[«"(]*\*', w)); n = w.count("*")
        e = bool(re.search(r'\*[.,!?…»"):;]*$', w)) and n >= (2 if s else 1)
        if s: on = True
        flags.append(on)
        if e: on = False
    # un pop au début de chaque groupe mis en valeur
    return [start + 0.45 + i * per for i, f in enumerate(flags) if f and (i == 0 or not flags[i - 1])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    plan = json.load(open(a.plan))
    slug = plan.get("slug", Path(a.plan).parent.name)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

    # 1) événements exacts depuis le moteur d'animation
    ev = json.loads(run(["node", "--experimental-strip-types", "--no-warnings", TPL / "scripts/stickman_events.ts", Path(a.plan).resolve()],
                        capture_output=True, text=True).stdout)
    json.dump(ev, open(out / "events.json", "w"), indent=1)
    total = ev["total"]
    m = plan.get("music", {})
    seed = m.get("seed", 1)

    # 2) banque de sons de la vidéo (variantes propres au projet)
    sd = out / "sfx"
    run([PY, ROOT / "tools/sfx_synth.py", sd, "--variants", 4, "--seed", seed, "--only", "footstep", "footstep_wet", "light_on", "shimmer", "whoosh_out", "pop"])
    plan_sfx = []
    add = lambda name, at, vol: plan_sfx.append({"src": str(sd / name), "at": round(max(0.0, at), 4), "volume": round(vol, 3)})
    for i, s in enumerate(ev["steps"]):
        kind = "footstep_wet" if s["wet"] else "footstep"
        vol = (0.42 if s["wet"] else 0.36) * s["strength"] * (0.82 if s["foot"] == "F" else 1.0)
        add(f"{kind}_{i % 4 + 1:02d}.wav", s["t"] - 0.004, vol)
    for i, sc in enumerate(ev["scenes"]):
        add(f"light_on_{i % 4 + 1:02d}.wav", sc["start"] + 0.02, 0.34)
        add(f"shimmer_{i % 4 + 1:02d}.wav", sc["start"] + 0.18, 0.09)
        if i < len(ev["scenes"]) - 1:
            add(f"whoosh_out_{i % 4 + 1:02d}.wav", sc["end"] - 0.45, 0.1)
        for k, tk in enumerate(caption_keyword_times(plan["scenes"][i], sc["start"])):
            add(f"pop_{k % 4 + 1:02d}.wav", tk, 0.12)
    # nappes de pluie (une par suite de scènes pluvieuses consécutives)
    spans, cur = [], None
    for sc in ev["scenes"]:
        if sc["rain"]:
            cur = [cur[0], sc["end"]] if cur else [sc["start"], sc["end"]]
        elif cur: spans.append(cur); cur = None
    if cur: spans.append(cur)
    for k, (s0, s1) in enumerate(spans):
        x = sfx_synth.rain_loop(np.random.default_rng(seed * 100 + k), d=(s1 - s0) + 0.8)
        f = sd / f"rain_{k}.wav"; sf.write(f, x.astype(np.float32), sfx_synth.SR, subtype="PCM_24")
        plan_sfx.append({"src": str(f), "at": round(max(0, s0 - 0.25), 3), "volume": 0.5})
    json.dump(plan_sfx, open(out / "sfx.json", "w"), indent=1)

    # 3) musique originale + mix (pas de voix : la musique n'est pas duckée)
    run([PY, ROOT / "tools/music_gen.py", out / "music.wav", "--mood", m.get("mood", "lofi"), "--bpm", m.get("bpm", 80),
         "--duration", total + 0.6, "--drop", m.get("drop", 1.2), "--seed", seed])
    run([PY, ROOT / "tools/mix_audio.py", out / "master.wav", "--music", out / "music.wav", "--sfx", out / "sfx.json",
         "--duration", total, "--music-db", m.get("db", -17)])

    # 4) fichiers pour Remotion + repères QC (appuis de pied = transitoires mesurables)
    pub = TPL / "public" / "projects" / slug; pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(out / "master.wav", pub / "master.wav")
    props = {**plan, "slug": slug, "audio": f"projects/{slug}/master.wav"}
    json.dump(props, open(out / "props.json", "w"), indent=1, ensure_ascii=False)
    json.dump([{"start": s["t"]} for s in ev["steps"] if s["strength"] >= 0.6], open(out / "qc_events.json", "w"))
    print(f"\nOK  {total:.2f}s  {len(ev['steps'])} pas  {len(ev['scenes'])} scènes  → {out}")
    print(f"Rendu : cd {TPL} && npx remotion render src/index.ts StickStory {out}/raw.mp4 --props={out}/props.json --concurrency=4")
    print(f"Fin   : tools/finish.sh {out}/raw.mp4 {out}/final.mp4 && python3 tools/qc_check.py {out}/final.mp4 --events {out}/qc_events.json")


if __name__ == "__main__":
    main()
