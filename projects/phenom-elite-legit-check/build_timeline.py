#!/usr/bin/env python3
"""Legit check Phenom Elite — voix montée + timeline (props Remotion + SFX).

Montage de la voix (temps d'origine, words.json = Whisper medium) :
  - coupe 21.50–27.85 : les 2 phrases sur les lacets (« écrit Nike Running → 1.1 / juste Running → authentique »)
    contredites par les photos (les 2 lacets portent « NIKE RUNNING ») ; remplacées par LACE_GAP s de silence
    pendant lesquelles l'écran montre la vraie différence (lettrage épais vs fin) — validé par l'utilisateur.
  - coupe 37.35–37.78 : « pardon ».
Puis ×SPEED (atempo, hauteur conservée) + chaîne voix dynamique (même réglage que le legit check du zip).
Tous les temps de la timeline sont écrits au tempo d'origine et passent par remap().
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from pedalboard import (Pedalboard, HighpassFilter, NoiseGate, LowShelfFilter, PeakFilter,
                        HighShelfFilter, Compressor, Gain, Limiter)

SPEED = 1.10
LACE_GAP = 2.8
CUTS = [(21.50, 27.85, LACE_GAP), (37.35, 37.78, 0.0)]   # (début, fin, silence inséré)
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "audio")


def remap(t):
    """temps d'origine → temps de la vidéo finale (coupes + accélération)."""
    shift = 0.0
    for a, b, gap in CUTS:
        if t >= b: shift += (b - a) - gap
        elif t > a: t = a + min(t - a, gap); break
    return round((t - shift) / SPEED, 3)


# 1) voix montée
y, sr = sf.read(os.path.join(HERE, "assets/voice.wav"), always_2d=True)
y = y[:, 0]
fade = int(0.03 * sr)
parts, pos = [], 0.0
for a, b, gap in CUTS:
    seg = y[int(pos * sr):int(a * sr)].copy()
    seg[-fade:] *= np.linspace(1, 0, fade)
    if pos > 0: seg[:fade] *= np.linspace(0, 1, fade)
    parts += [seg, np.zeros(int(gap * sr))]
    pos = b
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

# 2) sous-titres : élisions fusionnées, « 1 » + « .1 » → « 1.1 », corrections, mots coupés retirés
w = json.load(open(os.path.join(HERE, "words.json")))
m = []
for x in w:
    if m and (x["text"].startswith("'") or (x["text"].startswith(".1") and m[-1]["text"] == "1")):
        m[-1]["text"] += x["text"]; m[-1]["end"] = x["end"]
    else:
        m.append(dict(x))
FIX = {"Authentique": "authentique", "Authentique.": "authentique.", "l'Authentique,": "l'authentique,",
       "car": "grâce", "ça": "à", "m'emploie.": "mon plug."}
caps = []
for i, x in enumerate(m):
    if any(a - 0.05 <= x["start"] < b for a, b, _ in CUTS): continue
    t = x["text"]
    if 34.3 < x["start"] < 35.0: t = FIX.get(t, t)          # « car ça m'emploie » → « grâce à mon plug »
    else: t = FIX.get(t, t) if t not in ("car", "ça") else t
    caps.append({"text": t, "start": remap(x["start"]), "end": remap(x["end"]), "accent": False})
ACC = {"phenom", "elite", "authentique", "1.1", "lisse", "détails", "taille", "grisée", "blanc", "lacets",
       "12", "90", "message"}
for c in caps:
    c["accent"] = c["text"].strip(".,?!").lower().split("'")[-1] in ACC
json.dump(caps, open(os.path.join(HERE, "captions.json"), "w"), ensure_ascii=False, indent=0)

# 3) plans (tempo d'origine)
T0 = dict(vs=1.9, s1=3.4, c1=4.9, lisse=5.5, details=7.0, s2=9.8, c3=13.5, grisee=15.0, c4=16.5, blanc=17.1,
          s3=19.2, c5=21.5, fin=21.9, epais=22.9, s4=27.9, p12=31.6, p90=33.0, stamp=34.5, cta=37.8)
T = {n: remap(v) for n, v in T0.items()}
T["end"] = round(max(dur + 1.0, T["cta"] + 1.6), 2)
json.dump({"captions": caps, "T": T, "durationS": T["end"]}, open(os.path.join(HERE, "props.json"), "w"), ensure_ascii=False)

# 4) SFX (même grammaire que le zip : entrée, titre, coupe, verdict, compteur, tampon)
S = "projects/nike-rd-legit-check/audio/sfx/"
ev = []
def a(name, at, vol): ev.append({"src": S + name + ".wav", "at": remap(at), "volume": vol})
a("whoosh_in_01", 0.25, 0.5); a("whoosh_in_02", 0.55, 0.45); a("pop_01", 0.8, 0.5); a("pop_02", 1.1, 0.5)
a("sub_hit_01", T0["vs"], 0.38)
for t in (T0["s1"], T0["s2"], T0["s3"], T0["s4"]): a("sub_hit_02", t, 0.36); a("swish_01", t + 0.08, 0.45)
for t in (T0["c1"], T0["c3"], T0["c4"], T0["c5"]): a("whoosh_in_03", t - 0.12, 0.4)
for t in (T0["details"], T0["grisee"], T0["epais"]): a("blip_up_01", t, 0.45)
for t in (T0["lisse"], T0["blanc"], T0["fin"]): a("blip_down_01", t, 0.45)
a("swish_02", T0["blanc"] - 0.4, 0.4); a("swish_02", T0["grisee"] - 0.4, 0.4)
for base in (T0["p12"], T0["p90"]):
    for i in range(10): a("tick_0%d" % (i % 3 + 1), base + i * 0.075 * SPEED, 0.3)
a("sub_hit_03", T0["stamp"], 0.41); a("shimmer_01", T0["stamp"] + 0.05, 0.45); a("pop_03", T0["cta"], 0.5)
json.dump(ev, open(os.path.join(A, "sfx_timeline.json"), "w"), indent=0)
print(f"voix {dur:.2f}s · vidéo {T['end']}s · {len(caps)} mots · {len(ev)} SFX")
print(" ".join(c["text"] for c in caps))
