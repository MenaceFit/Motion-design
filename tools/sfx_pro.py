#!/usr/bin/env python3
"""Banque de SFX « montage pro » — synthèse 100 % originale, STÉRÉO, 48 kHz / 24 bits, libre de droits.

Pensée pour les edits GTA / gaming (transitions rapides) ; chaque son a un rôle :
  whoosh_lr / whoosh_rl   passage d'air 0,55 s qui traverse l'image G→D / D→G   → whip pan, push
  whoosh_long             souffle large 0,9 s centré, pic à 60 %                  → zoom-blur, transition majeure
  suck                    whoosh inversé (aspiration) qui culmine sur la coupe     → zoom avant, avant un mot-clé
  whip_lr / whip_rl       fouet très court 0,25 s                                  → micro-coupes, glitch, step
  boom                    impact sub 55→32 Hz + transitoire                         → hook, révélation, zoom-in
  hit                     impact médium (thump + claquement)                        → mot-clé, punch, alerte
  kaching                 tiroir-caisse : clac mécanique + cloches inharmoniques    → fin du compteur d'argent
  coins                   cascade de pièces                                          → récompense
  glitch                  stutter numérique bitcrushé, stéréo aléatoire             → transition glitch
  riser                   montée 1,4 s (bruit + sinus glissé) qui s'arrête net      → tension avant un drop
  pop                     bulle UI                                                   → apparition d'overlay
  key_1 … key_8           clic + note (gamme pentatonique montante)                  → touches du combo
  success                 deux notes montantes                                       → abonnement validé
  tick                    tic sec                                                    → compteur
  record_scratch          scratch de vinyle                                          → coupure musicale (« le piège »)
  rev_cymbal              cymbale inversée qui s'arrête net                          → juste avant un zoom / impact
  bell                    cloche de notification 2 notes                             → CTA abonnement (cloche)
  shutter                 déclencheur photo                                          → flash blanc
  sub_drop                chute grave 1,3 s                                          → ouverture / drop
  *_2, *_3                variantes de whoosh_lr / whoosh_rl / whoosh_long / hit

Usage : python3 tools/sfx_pro.py [out_dir] [--seed 7]
        (défaut : templates/remotion-kinetic/public/sfxpro, régénéré par gta_build.py si absent)
"""
import argparse
from pathlib import Path
import numpy as np
import soundfile as sf

SR = 48000
ROOT = Path(__file__).resolve().parent.parent


def tt(d):
    return np.arange(int(d * SR)) / SR


def svf_bandpass(x, fc, q=1.4):
    """Filtre à état variable (Chamberlin), fréquence de coupure variable échantillon par échantillon."""
    y = np.zeros_like(x); lp = bp = 0.0
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        y[i] = bp
    return y


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a) * x[i] + a * s; y[i] = s
    return y


def pan(mono, p):
    """Panoramique à puissance constante ; p ∈ [-1, 1] (scalaire ou courbe)."""
    p = np.broadcast_to(p, mono.shape)
    th = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(th), mono * np.sin(th)])


def finish(st, db=-1.0, reverb=0.0, room=0.25):
    from pedalboard import Pedalboard, Reverb, HighpassFilter, Limiter
    st = st.astype(np.float32)
    fx = [HighpassFilter(28)]
    if reverb: fx.append(Reverb(room_size=room, wet_level=reverb, dry_level=1.0, width=1.0))
    st = Pedalboard(fx)(st, SR)
    peak = np.abs(st).max() + 1e-9
    st = st / peak * 10 ** (db / 20)
    n = int(0.004 * SR); st[:, :n] *= np.linspace(0, 1, n); st[:, -n * 3:] *= np.linspace(1, 0, n * 3)
    return st


def env_pass(n, peak=0.58, a=2.2, rel=5.0):
    x = np.linspace(0, 1, n)
    up = (x / peak) ** a
    down = np.exp(-rel * (x - peak) / (1 - peak))
    return np.where(x < peak, up, down)


def whoosh(rng, d=0.55, direction=1, f_lo=350, f_hi=4200, peak=0.58, width=0.9):
    n = int(d * SR); x = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    traj = f_lo + (f_hi - f_lo) * np.exp(-((x - peak) / 0.22) ** 2)   # effet Doppler : monte puis redescend
    air = svf_bandpass(noise, traj, q=1.2) * 0.9
    body = lowpass(rng.standard_normal(n), 220) * 2.2                  # souffle grave
    e = env_pass(n, peak)
    mono = (air + body * 0.3) * e
    p = direction * width * (2 * (x * x * (3 - 2 * x)) - 1) if direction else np.zeros(n)
    return pan(mono, p)


def boom(rng, d=0.9):
    t = tt(d)
    f = 32 + 23 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 3.2)
    click = rng.standard_normal(len(t)) * np.exp(-t * 90) * 0.6
    thump = lowpass(rng.standard_normal(len(t)), 400) * np.exp(-t * 18) * 3
    mono = np.tanh(1.6 * (sub + click + thump))
    return pan(mono, 0.0)


def hit(rng, d=0.35):
    t = tt(d)
    f = 70 + 90 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
    snap = svf_bandpass(rng.standard_normal(len(t)), np.full(len(t), 2600.0), q=0.8) * np.exp(-t * 45) * 1.5
    return pan(np.tanh(1.4 * (body + snap)), 0.0)


def bell(t, f, dec, amp=1.0):
    return amp * np.sin(2 * np.pi * f * t) * np.exp(-t * dec)


def kaching(rng, d=1.1):
    t = tt(d)
    clack = svf_bandpass(rng.standard_normal(len(t)), np.full(len(t), 1800.0), q=2) * np.exp(-t * 60) * 1.2
    clack += lowpass(rng.standard_normal(len(t)), 600) * np.exp(-t * 40) * 2
    t2 = np.clip(t - 0.07, 0, None); on = (t >= 0.07)
    ring = sum(bell(t2, f, dc, a) for f, dc, a in [(2093, 4.5, 1), (2637, 5, .7), (3322, 6, .5), (4186, 7, .4), (5274, 9, .25)]) * on
    left = clack + ring * 0.9; right = clack * 0.9 + np.roll(ring, int(0.006 * SR))
    return np.stack([left, right])


def coins(rng, d=1.2, n=9):
    t = tt(d); st = np.zeros((2, len(t)))
    for k in range(n):
        t0 = 0.04 + k * 0.09 + rng.uniform(-0.02, 0.02)
        f = rng.uniform(3200, 5200); a = 0.9 - k * 0.06
        tk = np.clip(t - t0, 0, None) * (t >= t0)
        s = (np.sin(2 * np.pi * f * tk) + 0.5 * np.sin(2 * np.pi * f * 1.51 * tk)) * np.exp(-tk * 22) * (t >= t0) * a
        st += pan(s, rng.uniform(-0.6, 0.6))
    return st


def glitch(rng, d=0.38):
    n = int(d * SR); st = np.zeros((2, n)); i = 0
    while i < n:
        L = int(rng.uniform(0.012, 0.045) * SR); f = rng.choice([180, 340, 720, 1400, 2800])
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(L) / SR)) * 0.6 + rng.standard_normal(L) * 0.4
        seg = np.round(seg * 6) / 6 * (rng.uniform() > 0.2)
        st[:, i:i + L] += pan(seg[:max(0, min(L, n - i))], rng.uniform(-1, 1))
        i += L + int(rng.uniform(0, 0.01) * SR)
    return st * np.linspace(1, 0.4, n)


def riser(rng, d=1.4):
    t = tt(d); x = t / d
    noise = svf_bandpass(rng.standard_normal(len(t)), 500 + 5000 * x ** 2, q=1.5)
    tone = np.sin(2 * np.pi * np.cumsum(180 + 1500 * x ** 2.2) / SR) * 0.35
    mono = (noise + tone) * x ** 2.4
    return pan(mono, 0.6 * np.sin(2 * np.pi * 3 * x) * x)


def pop(rng, d=0.12):
    t = tt(d); f = 300 + 700 * np.exp(-t * 60)
    return pan(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35), 0.0)


def key(rng, k, d=0.22):
    t = tt(d)
    notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5]  # do ré mi sol la do ré mi
    f = notes[k % 8]
    tone = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 16) * 0.7
    clk = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.5
    return pan(tone + clk, -0.4 + 0.8 * k / 7)


def success(rng, d=0.6):
    t = tt(d); s = bell(t, 880, 8) * (t < 0.12) + bell(np.clip(t - 0.11, 0, None), 1318.5, 6) * (t >= 0.11)
    return pan(s, 0.0)


def tick(rng, d=0.05):
    t = tt(d)
    return pan(np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 160) + rng.standard_normal(len(t)) * np.exp(-t * 600) * 0.3, 0.0)


def record_scratch(rng, d=0.55):
    """Scratch de vinyle : bruit filtré dont la hauteur fait des allers-retours rapides (main sur le disque)."""
    t = tt(d); x = t / d
    rate = 1.0 + 0.9 * np.sin(2 * np.pi * (3 + 6 * x) * t) * np.exp(-x * 1.5)
    fc = 600 + 2200 * np.abs(rate - 0.2)
    noise = svf_bandpass(rng.standard_normal(len(t)), fc, q=3.0)
    tone = np.sin(2 * np.pi * np.cumsum(180 * rate) / SR) * 0.4
    mono = (noise * 1.4 + tone) * np.minimum(1, x * 20) * np.exp(-x * 2.2)
    return pan(np.tanh(1.5 * mono), 0.0)


def rev_cymbal(rng, d=0.6):
    """Cymbale inversée : souffle aigu qui monte et s'arrête net (aspiration avant un impact)."""
    t = tt(d); x = t / d
    n = rng.standard_normal(len(t)); n = n - lowpass(n, 3000)
    shimmer = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in (5400, 6900, 8200, 10100)) * 0.08
    mono = (n + shimmer) * x ** 3.2
    return np.stack([mono, np.roll(mono, int(0.004 * SR))])


def bell_ding(rng, d=1.0):
    t = tt(d)
    s = bell(t, 1567.98, 4.5) + bell(t, 2349.3, 6, .5) + bell(t, 3135.9, 8, .3)
    s2 = np.clip(t - 0.13, 0, None)
    s = s + (bell(s2, 2093, 4.5) + bell(s2, 3135.9, 7, .4)) * (t >= 0.13)
    return pan(s, 0.25)


def shutter(rng, d=0.18):
    t = tt(d)
    clk = rng.standard_normal(len(t)) * (np.exp(-t * 300) + 0.7 * np.exp(-np.clip(t - 0.06, 0, None) * 260) * (t >= 0.06))
    return pan(svf_bandpass(clk, np.full(len(t), 3500.0), q=0.7) * 2, 0.0)


def sub_drop(rng, d=1.3):
    t = tt(d)
    f = 30 + 70 * np.exp(-t * 2.2)
    return pan(np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)), 0.0)


def build(out, seed=7):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(seed)
    items = {
        "whoosh_lr": (whoosh(rng, 0.55, +1), -2, 0.10), "whoosh_rl": (whoosh(rng, 0.55, -1), -2, 0.10),
        "whoosh_long": (whoosh(rng, 0.9, 0, 260, 3200, 0.62), -2, 0.14),
        "suck": (whoosh(rng, 0.7, 0, 300, 3800, 0.93)[:, ::1], -2, 0.05),
        "whip_lr": (whoosh(rng, 0.25, +1, 700, 6000, 0.5), -3, 0.05), "whip_rl": (whoosh(rng, 0.25, -1, 700, 6000, 0.5), -3, 0.05),
        "whoosh_up": (whoosh(rng, 0.45, 0, 500, 5200, 0.55), -2, 0.10),
        "boom": (boom(rng), -0.5, 0.18), "hit": (hit(rng), -1, 0.08), "kaching": (kaching(rng), -2, 0.12),
        "coins": (coins(rng), -3, 0.10), "glitch": (glitch(rng), -4, 0.0), "riser": (riser(rng), -3, 0.15),
        "pop": (pop(rng), -4, 0.05), "success": (success(rng), -4, 0.12), "tick": (tick(rng), -6, 0.0),
    }
    for k in range(8):
        items[f"key_{k + 1}"] = (key(rng, k), -4, 0.08)
    items.update({"record_scratch": (record_scratch(rng), -2, 0.06), "rev_cymbal": (rev_cymbal(rng), -4, 0.05),
                  "bell": (bell_ding(rng), -4, 0.15), "shutter": (shutter(rng), -4, 0.03), "sub_drop": (sub_drop(rng), -1, 0.1)})
    # variantes (évite la répétition audible d'un même son sur 10+ transitions)
    for v in (2, 3):
        f_hi = 4200 + 900 * (v - 1); d = 0.5 + 0.06 * v
        items[f"whoosh_lr_{v}"] = (whoosh(rng, d, +1, 320, f_hi, 0.55 + 0.03 * v), -2, 0.10)
        items[f"whoosh_rl_{v}"] = (whoosh(rng, d, -1, 320, f_hi, 0.55 + 0.03 * v), -2, 0.10)
        items[f"whoosh_long_{v}"] = (whoosh(rng, 0.8 + 0.1 * v, 0, 240, 3000 + 500 * v, 0.6), -2, 0.14)
        items[f"hit_{v}"] = (hit(rng, 0.3 + 0.04 * v), -1, 0.08)
    for name, (st, db, rv) in items.items():
        sf.write(out / f"{name}.wav", finish(st, db, rv).T, SR, subtype="PCM_24")
    print(f"{len(items)} SFX → {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out", nargs="?", default=str(ROOT / "templates/remotion-kinetic/public/sfxpro"))
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    build(a.out, a.seed)
