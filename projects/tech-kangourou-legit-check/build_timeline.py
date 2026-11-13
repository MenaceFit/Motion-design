#!/usr/bin/env python3
"""Legit check Nike Tech Kangourou — voix montée + timeline (props Remotion + SFX).

Montage voix (temps d'origine, words.json = Whisper medium) :
  - coupe 31.15–32.45 : « Ensuite, » + blanc avant la conclusion.
Puis ×SPEED + chaîne voix dynamique (même réglage que les legit checks précédents).
Corrections de transcription (sens vérifié dans le contexte) : « en un point » → « un 1.1 »,
« ce punaise Tech » → « ce Nike Tech », « mon plat » → « mon plug », « je te vois mon blog » → « je t'envoie mon plug ».
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from pedalboard import (Pedalboard, HighpassFilter, NoiseGate, LowShelfFilter, PeakFilter,
                        HighShelfFilter, Compressor, Gain, Limiter)

SPEED = 1.10
CUTS = [(31.15, 32.45, 0.0)]
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "audio")


def remap(t):
    shift = 0.0
    for a, b, gap in CUTS:
        if t >= b: shift += (b - a) - gap
        elif t > a: t = a + min(t - a, gap); break
    return round((t - shift) / SPEED, 3)


# 1) voix
y, sr = sf.read(os.path.join(HERE, "assets/voice.wav"), always_2d=True)
y = y[:, 0]; fade = int(0.03 * sr); parts, pos = [], 0.0
for a, b, gap in CUTS:
    seg = y[int(pos * sr):int(a * sr)].copy(); seg[-fade:] *= np.linspace(1, 0, fade)
    if pos > 0: seg[:fade] *= np.linspace(0, 1, fade)
    parts += [seg, np.zeros(int(gap * sr))]; pos = b
seg = y[int(pos * sr):].copy(); seg[:fade] *= np.linspace(0, 1, fade); parts.append(seg)
tmp = os.path.join(A, "voice_edit.wav"); sf.write(tmp, np.concatenate(parts), sr)
fast = os.path.join(A, "voice_fast.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={SPEED}", "-ar", "48000", "-ac", "1", fast], check=True)
v, sr = sf.read(fast, always_2d=True)
chain = Pedalboard([
    HighpassFilter(90), NoiseGate(threshold_db=-48, ratio=3, release_ms=120),
    LowShelfFilter(cutoff_frequency_hz=280, gain_db=-2.5), PeakFilter(3800, 3.5, 0.9),
    HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.0),
    Compressor(threshold_db=-22, ratio=4, attack_ms=4, release_ms=90), Gain(6), Limiter(-1.0, 60)])
out = chain(v.T.astype(np.float32), sr).T
sf.write(os.path.join(A, "voice_dyn.wav"), out, sr, subtype="PCM_24")
dur = len(out) / sr

# 2) sous-titres
w = json.load(open(os.path.join(HERE, "words.json")))
m = []
for x in w:
    if m and (x["text"].startswith("'") or (x["text"].startswith(".1") and m[-1]["text"] == "1")):
        m[-1]["text"] += x["text"]; m[-1]["end"] = x["end"]
    else:
        m.append(dict(x))
# corrections ciblées par position (temps d'origine) : (début_min, début_max, ancien, nouveau)
FIX = [(29.8, 30.2, "un", "un"), (30.0, 30.3, "point.", "1.1."), (29.8, 30.0, "en", None),
       (32.4, 32.7, "ce", "Ce"), (32.4, 33.0, "punaise", "Nike"), (35.9, 36.2, "plat.", "plug."),
       (42.2, 42.3, "vois", "t'envoie"), (42.1, 42.3, "te", None), (42.4, 42.6, "blog.", "plug.")]
caps = []
for x in m:
    if any(a - 0.05 <= x["start"] < b for a, b, _ in CUTS): continue
    t = x["text"]
    for a, b, old, new in FIX:
        if a <= x["start"] <= b and t == old: t = new; break
    if t is None: continue
    t = {"Authentique": "authentique", "Authentique?": "authentique ?"}.get(t, t)
    caps.append({"text": t, "start": remap(x["start"]), "end": remap(x["end"]), "accent": False})
ACC = {"tech", "kangourou", "1.1", "authentique", "poches", "lisses", "petites", "logo", "lumière", "petit",
       "rouge", "cambodia", "china", "9€", "85€", "dm"}
for c in caps:
    c["accent"] = c["text"].strip(".,?!").lower().split("'")[-1] in ACC
json.dump(caps, open(os.path.join(HERE, "captions.json"), "w"), ensure_ascii=False, indent=0)

# 3) plans (tempo d'origine)
T0 = dict(vs=3.1, s1=3.8, c1=6.2, lisse=7.3, zipok=8.6, s2=9.7, c2=12.7, reflet=13.8, logook=15.8,
          s3=18.0, c3=21.7, cambodia=25.0, china=26.7, s4=32.45, p9=35.2, p85=38.6, stamp=39.6, cta=41.3)
T = {n: remap(v) for n, v in T0.items()}
T["end"] = round(max(dur + 1.0, T["cta"] + 1.6), 2)
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props.json"), "w"), ensure_ascii=False)

# 4) SFX
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, vol): ev.append({"src": S + name + ".wav", "at": remap(at), "volume": vol})
a("whoosh_in_01", 0.25, 0.5); a("whoosh_in_02", 0.55, 0.45); a("pop_01", 0.8, 0.5); a("pop_02", 1.1, 0.5)
a("sub_hit_01", T0["vs"], 0.38)
for t in (T0["s1"], T0["s2"], T0["s3"], T0["s4"]): a("sub_hit_02", t, 0.36); a("swish_01", t + 0.08, 0.45)
for t in (T0["c1"], T0["c2"], T0["c3"]): a("whoosh_in_03", t - 0.12, 0.4)
for t in (T0["zipok"], T0["logook"], T0["cambodia"]): a("blip_up_01", t, 0.45)
for t in (T0["lisse"], T0["reflet"], T0["china"]): a("blip_down_01", t, 0.45)
for base in (T0["p9"], T0["p85"]):
    for i in range(10): a("tick_0%d" % (i % 3 + 1), base + i * 0.075 * SPEED, 0.3)
a("sub_hit_03", T0["stamp"], 0.41); a("shimmer_01", T0["stamp"] + 0.05, 0.45); a("pop_03", T0["cta"], 0.5)
json.dump(ev, open(os.path.join(A, "sfx_timeline.json"), "w"), indent=0)
print(f"voix {dur:.2f}s · vidéo {T['end']}s · {len(caps)} mots · {len(ev)} SFX")
print(" ".join(c["text"] for c in caps))
