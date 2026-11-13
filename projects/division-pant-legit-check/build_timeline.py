#!/usr/bin/env python3
"""Legit check bas Nike Running Division — voix montée + timeline (props Remotion + SFX).

Montage voix (temps d'origine, words.json = Whisper medium) :
  - coupe 24.16–26.36 : « et Made in China, Fuyé » — l'étiquette du 1.1 fournie dit MADE IN CAMBODIA
    (écriture blanche) → seul « écrit en blanc → 1.1 » est gardé, cohérent avec la photo.
Puis ×SPEED + chaîne voix dynamique. Couleurs mesurées (médiane, haut du pantalon) : 1.1 #202024, authentique #424248.
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from pedalboard import (Pedalboard, HighpassFilter, NoiseGate, LowShelfFilter, PeakFilter,
                        HighShelfFilter, Compressor, Gain, Limiter)

SPEED = 1.10
CUTS = [(24.16, 26.36, 0.0)]
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
# corrections : (début_min, début_max, ancien, nouveau) — None = mot retiré de l'affichage
FIX = [(1.9, 2.2, "Bad", "bas"), (2.6, 2.7, "R", None), (2.9, 3.1, "&E", None), (38.8, 39.2, "Bad", "bas"),
       (41.8, 42.2, "Bad", "bas"), (30.8, 31.0, "Cambodia", "Cambodia."), (23.8, 24.2, "blanc", "blanc,"), (33.1, 33.3, "araignés,", "araignée,"), (49.4, 49.6, "plaf,", "plug,")]
caps = []
for x in m:
    if any(a - 0.05 <= x["start"] < b for a, b, _ in CUTS): continue
    t = x["text"]
    for a, b, old, new in FIX:
        if a <= x["start"] <= b and t == old: t = new; break
    if t is None: continue
    t = {"Authentic": "authentique", "'Authentic,": "'authentique,", "l'Authentic,": "l'authentique,"}.get(t, t)
    caps.append({"text": t, "start": remap(x["start"]), "end": remap(x["end"]), "accent": False})
# nettoyage d'affichage : guillemets isolés retirés, « l'1 .1, » et « au -dessus » recollés
clean = []
for c in caps:
    if c["text"].strip() in ("«", "»", "»,", "».", "»."): continue
    if c["text"].startswith(".1") and clean and clean[-1]["text"].endswith("1"):
        clean[-1]["text"] += c["text"]; clean[-1]["end"] = c["end"]; continue
    if c["text"].startswith("-") and clean: clean[-1]["text"] += c["text"]; clean[-1]["end"] = c["end"]; continue
    c["text"] = c["text"].replace("« ", "").replace(" »", ""); clean.append(c)
caps = clean
ACC = {"division", "1.1", "authentique", "couleur", "noir", "grise", "logo", "placé", "droit", "blanc", "cambodia",
       "araignée", "précis", "50", "180", "120", "énorme", "message"}
for c in caps:
    c["accent"] = c["text"].strip(".,?!").lower().split("'")[-1] in ACC
json.dump(caps, open(os.path.join(HERE, "captions.json"), "w"), ensure_ascii=False, indent=0)

# 3) plans (tempo d'origine)
T0 = dict(vs=4.1, s1=5.2, c1=7.3, noir=8.9, gris=12.4, s2=13.5, c2=15.2, place=16.1, droit=17.3, petit=18.1,
          s3=20.2, c3=22.7, blanc=23.82, grise=28.9, s4=31.8, c4=33.2, precis=34.5, pasprecis=35.4,
          s5=37.7, p50=40.6, p180=42.8, p120=45.9, stamp=47.4, cta=49.8)
T = {n: remap(v) for n, v in T0.items()}
T["end"] = round(max(dur + 1.0, T["cta"] + 1.6), 2)
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props.json"), "w"), ensure_ascii=False)

# 4) SFX
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, vol): ev.append({"src": S + name + ".wav", "at": remap(at), "volume": vol})
a("whoosh_in_01", 0.25, 0.5); a("whoosh_in_02", 0.55, 0.45); a("pop_01", 0.8, 0.5); a("pop_02", 1.1, 0.5)
a("sub_hit_01", T0["vs"], 0.38)
for t in (T0["s1"], T0["s2"], T0["s3"], T0["s4"], T0["s5"]): a("sub_hit_02", t, 0.36); a("swish_01", t + 0.08, 0.45)
for t in (T0["c1"], T0["c2"], T0["c3"], T0["c4"]): a("whoosh_in_03", t - 0.12, 0.4)
for t in (T0["gris"], T0["place"], T0["droit"], T0["petit"], T0["grise"], T0["precis"]): a("blip_up_01", t, 0.42)
for t in (T0["noir"], T0["blanc"], T0["pasprecis"]): a("blip_down_01", t, 0.45)
a("pop_02", T0["c1"] + 0.9, 0.4); a("pop_03", T0["c1"] + 1.2, 0.4)          # pastilles couleur
for base in (T0["p50"], T0["p180"], T0["p120"]):
    for i in range(10): a("tick_0%d" % (i % 3 + 1), base + i * 0.075 * SPEED, 0.28)
a("sub_hit_03", T0["stamp"], 0.41); a("shimmer_01", T0["stamp"] + 0.05, 0.45); a("pop_03", T0["cta"], 0.5)
json.dump(ev, open(os.path.join(A, "sfx_timeline.json"), "w"), indent=0)
print(f"voix {dur:.2f}s · vidéo {T['end']}s · {len(caps)} mots · {len(ev)} SFX")
print(" ".join(c["text"] for c in caps))
