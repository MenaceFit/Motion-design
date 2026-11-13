#!/usr/bin/env python3
"""Version « arcade » (format jeu) du legit check Division — principes tirés des références analysées
(references/analyses/legitcheck-ref) : jeu « un seul est vrai » + compte à rebours, score x/4, étapes N°,
écran « t'en avais combien ? » (appel au commentaire), DA pixel rétro.

Réutilise la voix déjà montée par build_timeline.py (voice_dyn.wav, captions.json, props.json) et :
  - ajoute OFF secondes de jeu d'intro avant la voix (musique + SFX seulement) ;
  - insère GAP secondes de silence avant « Donc voilà » pour l'écran de score.
Sorties : audio/voice_arcade.wav, props_arcade.json, audio/sfx_arcade.json
"""
import json, os
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "audio")
OFF, GAP = 6.8, 3.4
base = json.load(open(os.path.join(HERE, "props.json")))
T0 = base["T"]
T_GAP = T0["s5"] - 0.05                       # juste avant « Donc voilà »
f = lambda t: round(t + OFF + (GAP if t >= T_GAP else 0.0), 3)

# voix : silence d'intro + pause de score
v, sr = sf.read(os.path.join(A, "voice_dyn.wav"), always_2d=True)
cut = int(T_GAP * sr)
voice = np.concatenate([np.zeros((int(OFF * sr), v.shape[1])), v[:cut], np.zeros((int(GAP * sr), v.shape[1])), v[cut:]])
sf.write(os.path.join(A, "voice_arcade.wav"), voice, sr, subtype="PCM_24")

caps = [{**c, "start": f(c["start"]), "end": f(c["end"])} for c in base["captions"]]
T = {k: f(v) for k, v in T0.items() if k != "end"}
# temps propres au jeu d'intro (absolus)
T.update(dict(title=0.15, cards=1.0, question=2.0, three=3.0, cd3=3.3, cd2=4.1, cd1=4.9, reveal=5.7,
              compte=OFF + 0.6, score=T_GAP + OFF + 0.05, scoreQ=T_GAP + OFF + 0.6, comment=T_GAP + OFF + 1.6))
# points : chaque critère validé côté authentique
T.update(pt1=T["gris"], pt2=T["petit"] + 0.5, pt3=T["grise"], pt4=T["precis"])
T["end"] = round(len(voice) / sr + 1.2, 2)
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props_arcade.json"), "w"), ensure_ascii=False)

# SFX : chaque son a une fonction (cf. CLAUDE.md)
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, vol): ev.append({"src": S + name + ".wav", "at": round(at, 3), "volume": vol})
a("typewriter_01", T["title"], 0.35); a("typewriter_02", T["title"] + 0.25, 0.3)        # titre tapé
a("whoosh_in_01", T["cards"], 0.45); a("pop_01", T["cards"] + 0.25, 0.45); a("pop_02", T["cards"] + 0.45, 0.45)
a("typewriter_03", T["question"], 0.3); a("blip_up_02", T["three"], 0.35)
for t in (T["cd3"], T["cd2"], T["cd1"]): a("tick_01", t, 0.6); a("click_01", t + 0.4, 0.35)  # compte à rebours
a("riser_01", T["cd3"], 0.25)
a("glitch_01", T["reveal"], 0.4); a("sub_hit_01", T["reveal"], 0.45); a("blip_up_01", T["reveal"] + 0.15, 0.5)
a("blip_down_01", T["reveal"] + 0.05, 0.4); a("shimmer_01", T["reveal"] + 0.2, 0.35)
a("typewriter_01", T["compte"], 0.3)
for k in ("s1", "s2", "s3", "s4"): a("glitch_02", T[k], 0.3); a("swish_01", T[k] + 0.05, 0.4); a("typewriter_02", T[k] + 0.3, 0.28)
for k in ("noir", "blanc", "pasprecis"): a("blip_down_01", T[k], 0.45)
for k in ("place", "droit", "petit"): a("click_02", T[k], 0.4)
for k in ("pt1", "pt2", "pt3", "pt4"): a("blip_up_01", T[k], 0.45); a("shimmer_02", T[k] + 0.08, 0.3)   # +1
a("glitch_01", T["score"], 0.35); a("typewriter_03", T["score"] + 0.1, 0.3); a("sub_hit_02", T["scoreQ"], 0.4)
a("pop_03", T["comment"], 0.45)
a("whoosh_in_02", T["s5"] - 0.1, 0.4)
for base_t in (T["p50"], T["p180"], T["p120"]):
    for i in range(10): a("tick_0%d" % (i % 3 + 1), base_t + i * 0.08, 0.26)
a("sub_hit_03", T["stamp"], 0.4); a("shimmer_01", T["stamp"] + 0.05, 0.4); a("pop_03", T["cta"], 0.5)
json.dump(ev, open(os.path.join(A, "sfx_arcade.json"), "w"), indent=0)
print(f"vidéo {T['end']}s · voix démarre à {OFF}s · {len(ev)} SFX")
print({k: T[k] for k in ("reveal", "s1", "s2", "s3", "s4", "score", "s5", "cta")})
