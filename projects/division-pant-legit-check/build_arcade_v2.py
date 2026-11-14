#!/usr/bin/env python3
"""Arcade legit check v2 — voix ElevenLabs (script écrit pour le format jeu), tout calé dessus.

Voix (assets/voice_el.wav, words_el.json = Whisper medium) :
  - traitement : passe-haut 80 Hz, -1,5 dB à 250 Hz, +2,5 dB à 3,5 kHz (présence), air +1,5 dB,
    compression 3:1, petite pièce (reverb 6 %) pour la « coller » au mix, limiteur ;
  - GAP s de silence insérées avant « Moi, je l'ai eu » : l'écran du score respire.
Corrections d'affichage : « arémiers » → « araignées », « 1 .1 » → « 1.1 », « 120 bénéfices » → « 120 de bénef ».
Sorties : audio/voice_arcade_v2.wav, props_arcade_v2.json, audio/sfx_arcade_v2.json
"""
import json, os
import numpy as np, soundfile as sf
from pedalboard import (Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor,
                        Reverb, Gain, Limiter)

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "audio")
GAP_AT, GAP = 34.0, 1.2
f = lambda t: round(t + (GAP if t >= GAP_AT else 0.0), 3)

# 1) voix
y, sr = sf.read(os.path.join(HERE, "assets/voice_el.wav"), always_2d=True)
chain = Pedalboard([HighpassFilter(80), LowShelfFilter(cutoff_frequency_hz=250, gain_db=-1.5), PeakFilter(3500, 2.5, 0.9),
                    HighShelfFilter(cutoff_frequency_hz=10000, gain_db=1.5),
                    Compressor(threshold_db=-20, ratio=3, attack_ms=5, release_ms=100),
                    Reverb(room_size=0.12, damping=0.6, wet_level=0.06, dry_level=0.97, width=0.4), Gain(3), Limiter(-1.0, 60)])
v = chain(y.T.astype(np.float32), sr).T
cut = int(GAP_AT * sr)
v = np.concatenate([v[:cut], np.zeros((int(GAP * sr), v.shape[1])), v[cut:]])
sf.write(os.path.join(A, "voice_arcade_v2.wav"), v, sr, subtype="PCM_24")

# 2) sous-titres
w = json.load(open(os.path.join(HERE, "words_el.json")))
m = []
for x in w:
    if m and (x["text"].startswith("'") or x["text"].startswith("-") or (x["text"].startswith(".1") and m[-1]["text"] == "1")):
        m[-1]["text"] += x["text"]; m[-1]["end"] = x["end"]
    else:
        m.append(dict(x))
FIX = {"arémiers.": "araignées.", "bénéfices.": "de bénef.", "180.": "180 €."}
caps = [{"text": FIX.get(x["text"], x["text"]), "start": f(x["start"]), "end": f(x["end"]), "accent": False} for x in m]

# 3) plans (temps de la voix d'origine → f)
T0 = dict(title=0.0, cards=0.9, question=1.2, three=2.1, cd3=3.1, cd2=3.8, cd1=4.7, reveal=5.6, compte=6.8,
          s1=7.6, noir=10.1, gris=12.5, s2=13.2, place=14.6, droit=15.5, petit=16.2, pt2=17.5,
          s3=18.3, blanc=20.1, grise=23.1, s4=24.0, precis=27.0, pasprecis=28.9,
          score=29.8, scoreQ=31.8, comment=32.8, s5=34.05, p50=35.0, p180=36.6, p120=38.0, stamp=38.5, cta=39.1)
T = {k: f(t) for k, t in T0.items()}
T.update(pt1=T["gris"], pt3=T["grise"], pt4=T["precis"])
T["end"] = round(len(v) / sr + 1.3, 2)
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props_arcade_v2.json"), "w"), ensure_ascii=False)

# 4) SFX (une fonction par son)
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, vol): ev.append({"src": S + name + ".wav", "at": round(at, 3), "volume": vol})
a("typewriter_01", T["title"] + 0.05, 0.3)
a("whoosh_in_01", 0.9, 0.42); a("pop_01", 1.15, 0.42); a("pop_02", 1.35, 0.42)                 # cartes qui tombent
a("blip_up_02", T["three"], 0.3); a("riser_01", T["cd3"], 0.22)
for t in (T["cd3"], T["cd2"], T["cd1"]): a("tick_01", t, 0.55)                                  # 3-2-1
a("glitch_01", T["reveal"], 0.38); a("sub_hit_01", T["reveal"], 0.42); a("blip_up_01", T["reveal"] + 0.15, 0.45)
a("blip_down_01", T["reveal"] + 0.05, 0.38); a("shimmer_01", T["reveal"] + 0.2, 0.32)
for k in ("s1", "s2", "s3", "s4"): a("glitch_02", T[k] - 0.05, 0.28); a("swish_01", T[k], 0.38)  # transition pixel
for k in ("noir", "blanc", "pasprecis"): a("blip_down_01", T[k], 0.42); a("sub_hit_02", T[k], 0.22)
for k in ("place", "droit", "petit"): a("click_02", T[k], 0.38)
for k in ("pt1", "pt2", "pt3", "pt4"): a("blip_up_01", T[k], 0.42); a("shimmer_02", T[k] + 0.08, 0.28)
a("glitch_01", T["score"], 0.32); a("sub_hit_02", T["scoreQ"], 0.38); a("pop_03", T["comment"], 0.42)
a("whoosh_in_02", T["s5"] - 0.1, 0.38)
for b in (T["p50"], T["p180"], T["p120"]):
    for i in range(9): a("tick_0%d" % (i % 3 + 1), b + i * 0.08, 0.24)
a("sub_hit_03", T["stamp"], 0.36); a("shimmer_01", T["stamp"] + 0.05, 0.36); a("pop_03", T["cta"], 0.45)
json.dump(ev, open(os.path.join(A, "sfx_arcade_v2.json"), "w"), indent=0)
print(f"vidéo {T['end']}s · {len(caps)} mots · {len(ev)} SFX")
print(" ".join(c["text"] for c in caps))
