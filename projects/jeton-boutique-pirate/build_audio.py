#!/usr/bin/env python3
"""Bande son de la vidéo « Jeton de la Boutique Pirate » (10 s) : musique originale + SFX calés
sur les impacts de src/PirateToken.tsx + mix -14 LUFS. Usage : python3 build_audio.py <dossier_sortie>"""
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
py, T = sys.executable, ROOT / "tools"
lib = ROOT / "templates/remotion-kinetic/public/sfxlib"
run = lambda *c: subprocess.run([str(x) for x in c], check=True)
run(py, T / "music_gen.py", out / "music.wav", "--mood", "hype", "--bpm", 128, "--duration", 10.5, "--drop", 0.02, "--seed", 41)
run(py, T / "sfx_synth.py", out / "sfx", "--variants", 3, "--seed", 41, "--only", "whoosh_in", "swish", "sub_hit", "pop", "tick", "riser", "shimmer")
S = lambda n: str(out / "sfx" / f"{n}.wav")
L = lambda n: str(lib / f"{n}.wav")
ev = [  # (son, temps s, volume) — chaque son souligne un mouvement précis de l'animation
    (L("jsfxr/explosion_1"), 0.0, 0.55), (S("sub_hit_01"), 0.0, 0.7),        # flash + zoom coffre
    (S("swish_01"), 0.53, 0.5),                                               # cut → jeton
    (L("zzfx/impact"), 1.2, 0.6), (L("jsfxr/explosion_2"), 1.2, 0.4),        # « GRATUITE »
    (S("whoosh_in_01"), 1.75, 0.4), (S("sub_hit_02"), 2.0, 0.6),             # médaillon du jeton
    (L("uisfx/cinematic/achievement"), 2.05, 0.45), (S("shimmer_01"), 2.2, 0.35),
    (S("riser_01"), 2.9, 0.25),                                               # rouleaux qui tournent
] + [(S(f"tick_0{1 + i % 3}"), round(2.9 + 0.25 + i * 0.14, 3), 0.55) for i in range(6)] + [  # arrêt de chaque chiffre
    (L("uisfx/cinematic/reward"), 4.25, 0.6), (L("zzfx/impact"), 4.25, 0.5),  # JACKPOT « ?! »
    (S("whoosh_in_02"), 4.85, 0.5),                                           # whip vers le CTA
    (S("pop_01"), 5.2, 0.45),                                                 # bouton apparaît
    (L("jsfxr/click_1"), 5.95, 0.7), (S("sub_hit_03"), 5.95, 0.35),          # clic du doigt
    (L("uisfx/cinematic/notification"), 6.62, 0.6),                           # cloche
    (S("swish_02"), 7.03, 0.45), (S("swish_03"), 7.48, 0.45),                # cuts coffres
    (L("zzfx/impact"), 8.0, 0.5), (S("riser_02"), 8.05, 0.2),                # compteur 10 000
    (L("uisfx/cinematic/success"), 8.8, 0.5),
    (S("pop_02"), 9.0, 0.45), (S("shimmer_02"), 9.05, 0.3),                  # « ensemble ? »
    (S("whoosh_in_03"), 9.7, 0.35),                                           # flash de boucle
]
json.dump([{"src": s, "at": a, "volume": v} for s, a, v in ev], open(out / "sfx.json", "w"), indent=1)
run(py, T / "mix_audio.py", out / "master.wav", "--music", out / "music.wav", "--sfx", out / "sfx.json", "--duration", 10.0, "--music-db", -9)
json.dump([{"start": a} for _, a, _ in ev], open(out / "events.json", "w"))
print("OK", out / "master.wav")
