#!/usr/bin/env python3
"""SFX doux et ronds (alternative aux blips 8-bit, jugés agressifs) :
  count_soft.wav  : « tock » marimba (sinus + harmonique 4x amortie, attaque 4 ms) — compte à rebours
  count_last.wav  : même timbre une quinte au-dessus (le « 1 »)
  heartbeat.wav   : double pulsation grave filtrée — tension discrète sous le compte à rebours
  reveal_bell.wav : accord majeur doux (cloche FM légère) — révélation
Usage : python3 tools/soft_sfx.py out_dir"""
import sys, os, numpy as np, soundfile as sf
SR = 48000
def env(n, a=0.004, d=0.35):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1.0) * np.exp(-t / d)
def tone(f, dur, d, harm=(1.0, 0.25, 0.08)):
    n = int(SR * dur); t = np.arange(n) / SR
    x = harm[0] * np.sin(2 * np.pi * f * t) + harm[1] * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.04) + harm[2] * np.sin(2 * np.pi * f * 2 * t)
    return x * env(n, d=d)
def norm(x, db=-6): return (x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)).astype(np.float32)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
sf.write(f"{out}/count_soft.wav", norm(tone(587.3, 0.6, 0.16)), SR)            # ré5
sf.write(f"{out}/count_last.wav", norm(tone(880.0, 0.8, 0.22)), SR)            # la5
n = int(SR * 0.9); t = np.arange(n) / SR
hb = np.zeros(n)
for o, g in [(0.0, 1.0), (0.18, 0.7)]:
    k = (t >= o); tt = t[k] - o
    hb[k] += g * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.09) * np.minimum(tt / 0.006, 1)
sf.write(f"{out}/heartbeat.wav", norm(hb, -8), SR)
n = int(SR * 1.6); t = np.arange(n) / SR
bell = sum(np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.3)) * np.exp(-t / 0.55) / (i + 1)
           for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]))
sf.write(f"{out}/reveal_bell.wav", norm(bell * np.minimum(t / 0.005, 1), -6), SR)
print("ok")
