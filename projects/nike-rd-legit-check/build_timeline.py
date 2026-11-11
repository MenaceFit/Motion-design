#!/usr/bin/env python3
"""Voix « dynamique » + timeline complète (props Remotion + SFX) recalées sur la vitesse de la voix.

1. Voix : accélération ×SPEED sans changer la hauteur (ffmpeg atempo), puis chaîne broadcast :
   passe-haut 90 Hz, gate léger (souffle entre les phrases), -2,5 dB à 280 Hz (boue de téléphone),
   +3,5 dB à 3,8 kHz (présence), +2 dB air à 10 kHz, compression 4:1 (voix punchy et régulière).
2. Timings : captions.json, plans (T) et SFX définis ici au tempo d'origine, divisés par SPEED.
Usage : python3 projects/nike-rd-legit-check/build_timeline.py
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from pedalboard import (Pedalboard, HighpassFilter, NoiseGate, LowShelfFilter, PeakFilter,
                        HighShelfFilter, Compressor, Gain, Limiter)

SPEED = 1.10
# Fin de la voix (s, tempo d'origine) : coupée après « grâce à mon plug » — la phrase sur la revente
# disait « 80 € », prix corrigé à 110 € par l'utilisateur → le prix est porté par l'écran, pas par la voix.
CUT = 37.70
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "audio")
k = lambda t: round(t / SPEED, 3)

# 1) voix
tmp = os.path.join(A, "voice_fast.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(HERE, "assets/voice.wav"),
                "-af", f"atrim=0:{CUT},afade=t=out:st={CUT - 0.08}:d=0.08,atempo={SPEED}", "-ar", "48000", "-ac", "1", tmp], check=True)
y, sr = sf.read(tmp, always_2d=True)
chain = Pedalboard([
    HighpassFilter(90), NoiseGate(threshold_db=-48, ratio=3, release_ms=120),
    LowShelfFilter(cutoff_frequency_hz=280, gain_db=-2.5), PeakFilter(3800, 3.5, 0.9),
    HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.0),
    Compressor(threshold_db=-22, ratio=4, attack_ms=4, release_ms=90), Gain(6), Limiter(-1.0, 60)])
out = chain(y.T.astype(np.float32), sr).T
sf.write(os.path.join(A, "voice_dyn.wav"), out, sr, subtype="PCM_24")
dur = len(out) / sr

# 2) plans (secondes au tempo d'origine, calés sur words.json)
T0 = dict(vs=2.6, s1=5.5, c1=7.9, claire=9.9, c2=10.6, foncee=12.4, s2=13.3, c3=16.5, grisee=18.4, c4=19.2,
          blanche=22.0, s3=23.2, c5=25.9, traces=28.2, c6=29.0, grossiers=31.3, s4=33.1, p30=36.0, p80=37.75,
          stamp=39.6)
T = {n: k(v) for n, v in T0.items()}
T["end"] = round(max(dur + 0.9, T["stamp"] + 1.4), 2)
caps = json.load(open(os.path.join(HERE, "captions.json")))
caps = [{**c, "start": k(c["start"]), "end": k(c["end"])} for c in caps if c["start"] < CUT]
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props.json"), "w"), ensure_ascii=False)

# 3) SFX (chaque son a une fonction : entrée, coupe, verdict, compteur, tampon)
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, v): ev.append({"src": S + name + ".wav", "at": k(at), "volume": v})
a("whoosh_in_01", 0.25, 0.5); a("whoosh_in_02", 0.55, 0.45); a("pop_01", 0.8, 0.5); a("pop_02", 1.1, 0.5)
a("sub_hit_01", 2.6, 0.38)                                         # VS
for t in (5.5, 13.3, 23.2): a("sub_hit_02", t, 0.36); a("swish_01", t + 0.08, 0.45)   # titres d'étape
a("pop_03", 6.1, 0.45); a("pop_01", 6.4, 0.45)                     # pastilles couleur
for t in (7.9, 10.6, 16.5, 19.2, 25.9, 29.0, 33.1):                # coupes
    a("whoosh_out_01" if t in (10.6, 19.2, 29.0) else "whoosh_in_03", t - 0.12, 0.4)
for t in (9.9, 18.4, 28.2): a("blip_up_01", t, 0.45)               # verdict authentique
for t in (12.4, 22.0, 31.3): a("blip_down_01", t, 0.45)            # verdict 1.1
for t in (21.6, 30.8): a("swish_02", t, 0.4)                       # cercles
for base in (36.0, 37.75):                                          # compteurs de prix
    for i in range(10 if base < 37 else 14): a("tick_0%d" % (i % 3 + 1), base + i * 0.075 * SPEED, 0.3)
a("pop_02", 38.75, 0.5)                                            # étiquette MODÈLE RARE
a("sub_hit_03", 39.6, 0.41); a("shimmer_01", 39.65, 0.45)          # tampon LEGIT
json.dump(ev, open(os.path.join(A, "sfx_timeline.json"), "w"), indent=0)
print(f"voix {dur:.2f}s · vidéo {T['end']}s · {len(caps)} mots · {len(ev)} SFX")
