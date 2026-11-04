#!/usr/bin/env python3
"""Synthèse procédurale de SFX motion design — 100 % originaux, libres de droits.

Pourquoi : les banques (Freesound, Pixabay…) ne sont pas toujours joignables et
leurs licences varient. Ces sons sont générés mathématiquement → aucun risque
Content ID, utilisables commercialement.

Sons produits (WAV 48 kHz, 24 bits, mono) :
  pop          bulle courte, pitch descendant        → apparition de mot / icône
  click        transitoire UI sec                    → sous-titre mot à mot, curseur
  tick         tic d'horloge / compteur              → compteur qui défile
  whoosh_in    bruit filtré passe-bande montant      → entrée rapide, slide
  whoosh_out   version inversée                      → sortie / transition
  swish        whoosh très court (120 ms)            → micro-mouvement, rotation
  sub_hit      impact grave 45→30 Hz + transitoire   → révélation, mot-clé fort
  riser        montée de bruit + sinus glissé (2 s)  → tension avant un drop
  blip_up/down bip UI deux notes                     → validation / erreur
  glitch       granulaire haché                      → transition glitch
  shimmer      cloche douce (partiels inharmoniques) → idée, étincelle, lumière
  typewriter   frappe mécanique courte               → texte tapé

Usage : python3 tools/sfx_synth.py out_dir [--seed 1] [--variants 3]
"""
import argparse, os
import numpy as np
import soundfile as sf

SR = 48000


def t(d):
    return np.arange(int(SR * d)) / SR


def env_adsr(n, a=0.005, d=0.05, s=0.0, r=0.1, peak=1.0):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([np.linspace(0, peak, a_n, endpoint=False),
                        np.linspace(peak, s, d_n, endpoint=False),
                        np.full(s_n, s), np.linspace(s, 0, r_n)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def bandpass_sweep(noise, f0, f1, q=4.0):
    """Filtre passe-bande d'état variable (SVF) dont la fréquence glisse f0→f1 (exp)."""
    n = len(noise)
    fc = f0 * (f1 / f0) ** np.linspace(0, 1, n)
    low = band = 0.0
    out = np.empty(n)
    damp = 1.0 / q
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = noise[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = band
    return out


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y


def norm(x, db=-3.0):
    p = np.max(np.abs(x)) + 1e-9
    return x / p * (10 ** (db / 20))


def fade(x, ms=3):
    n = int(SR * ms / 1000)
    x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    return x


def pop(rng):
    d = 0.12; tt = t(d)
    f = 900 * (1 + rng.uniform(-.15, .15)) * np.exp(-tt * 28) + 180
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * env_adsr(len(tt), .001, .03, .25, .08), -4)


def click(rng):
    n = int(SR * .025)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * .002))
    x += 0.6 * np.sin(2 * np.pi * rng.uniform(2500, 3500) * t(.025)) * np.exp(-np.arange(n) / (SR * .004))
    return norm(x, -6)


def tick(rng):
    n = int(SR * .04)
    x = np.sin(2 * np.pi * rng.uniform(1800, 2200) * t(.04)) * np.exp(-np.arange(n) / (SR * .006))
    x += 0.3 * rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * .001))
    return norm(x, -8)


def whoosh(rng, d=0.55, rev=False):
    n = int(SR * d)
    x = bandpass_sweep(rng.standard_normal(n), 250, rng.uniform(3500, 5000), q=2.5)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    e = e ** (0.6 if not rev else 1.0)
    x = x * e
    # léger élargissement : doublement retardé (perçu plus « air »)
    x = x + 0.35 * np.pad(x, (int(SR * .012), 0))[:n]
    x = fade(norm(x, -5))
    return x[::-1].copy() if rev else x


def sub_hit(rng):
    d = 1.4; tt = t(d)
    f = 30 + 25 * np.exp(-tt * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    trans = lowpass(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 60) * 1.5
    x = np.tanh(1.8 * (body + trans))
    return fade(norm(x, -1.5))


def riser(rng, d=2.0):
    tt = t(d); n = len(tt)
    nz = bandpass_sweep(rng.standard_normal(n), 300, 7000, q=3.0)
    tone = np.sin(2 * np.pi * np.cumsum(200 * (8 ** (tt / d))) / SR) * 0.25
    e = (tt / d) ** 2.4
    x = (nz + tone) * e
    x[-int(SR * .01):] *= np.linspace(1, 0, int(SR * .01))
    return norm(x, -4)


def blip(rng, up=True):
    a, b = (880, 1320) if up else (660, 440)
    seg = lambda f: np.sin(2 * np.pi * f * t(.07)) * env_adsr(int(SR * .07), .002, .02, .5, .03)
    x = np.concatenate([seg(a), np.zeros(int(SR * .01)), seg(b)])
    return norm(x, -9)


def glitch(rng):
    out = []
    for _ in range(rng.integers(6, 11)):
        g = rng.uniform(.012, .045)
        kind = rng.integers(3)
        tt = t(g)
        if kind == 0: s = np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * tt))
        elif kind == 1: s = rng.standard_normal(len(tt))
        else: s = np.round(np.sin(2 * np.pi * rng.uniform(200, 3000) * tt) * 3) / 3
        out.append(s * rng.uniform(.3, 1)); out.append(np.zeros(int(SR * rng.uniform(0, .015))))
    return fade(norm(np.concatenate(out), -8), 1)


def shimmer(rng):
    d = 1.6; tt = t(d)
    base = rng.uniform(900, 1300)
    x = sum(np.sin(2 * np.pi * base * r * tt + rng.uniform(0, 6)) * np.exp(-tt * (2.5 + 2 * i)) / (i + 1)
            for i, r in enumerate([1, 2.76, 5.4, 8.93]))
    x *= env_adsr(len(tt), .01, .1, .7, .8)
    return norm(x, -10)


def typewriter(rng):
    n = int(SR * .06)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * .004))
    x = lowpass(x, rng.uniform(3000, 5000))
    x[:int(SR * .004)] += np.sin(2 * np.pi * 140 * t(.004)) * .8
    return norm(x, -8)


# --- Ajouts « Spotlight Noir » (ref09/ref10) : sons de caméra et d'enseigne néon ---
def whip(rng):
    """Whip pan : souffle très court et brillant, attaque rapide, pic aux 2/3 (vitesse max de la caméra)."""
    d = rng.uniform(.22, .3); n = int(SR * d)
    x = bandpass_sweep(rng.standard_normal(n), 600, rng.uniform(6000, 8000), q=1.8)
    tt = np.linspace(0, 1, n)
    e = np.where(tt < .66, (tt / .66) ** 2.5, ((1 - tt) / .34) ** 1.4)
    x = x * e
    x = x + 0.25 * np.pad(x, (int(SR * .007), 0))[:n]
    return fade(norm(x, -4))


def neon_flicker(rng):
    """Enseigne néon qui s'allume : bourdonnement 100 Hz + harmoniques, coupé par à-coups, crépitements."""
    d = rng.uniform(.38, .5); tt = t(d); n = len(tt)
    hum = sum(np.sin(2 * np.pi * 100 * k * tt) / k for k in (1, 2, 3, 5, 7))
    gate = np.zeros(n); i = 0
    while i < n:
        on = int(SR * rng.uniform(.015, .06)); off = int(SR * rng.uniform(.01, .05) * (1 - i / n))
        gate[i:i + on] = rng.uniform(.5, 1); i += on + off
    gate = lowpass(gate, 400)
    crack = rng.standard_normal(n) * (rng.random(n) > .996) * 4
    x = hum * gate * .5 + lowpass(crack, 5000)
    x[int(n * .8):] *= np.linspace(1, .55, n - int(n * .8))
    return fade(norm(x, -6))


def heartbeat(rng):
    """Double battement grave (lub-dub) : 2 impulsions sinus 55→40 Hz."""
    def thump(d, f0):
        tt = t(d); f = f0 * np.exp(-tt * 6) + 38
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
    x = np.concatenate([thump(.18, 70), np.zeros(int(SR * .1)), thump(.22, 58) * .75, np.zeros(int(SR * .2))])
    return fade(norm(np.tanh(2 * x), -2))


def boom(rng):
    """Impact cinéma pour carte mot-clé : sub + corps saturé + queue de bruit filtré (réverb simulée)."""
    d = 2.2; tt = t(d)
    f = 34 + 60 * np.exp(-tt * 12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.4)
    snap = lowpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 45) * 2
    tail = lowpass(rng.standard_normal(len(tt)), 700) * np.exp(-tt * 3) * .25
    return fade(norm(np.tanh(1.6 * (body + snap + tail)), -1.5))


def zoom_in(rng):
    """Zoom caméra rapide : souffle montant 0,45 s qui s'arrête net (fin = arrivée du cadre)."""
    d = .45; n = int(SR * d)
    x = bandpass_sweep(rng.standard_normal(n), 200, 4500, q=3.0)
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(120, 600, n)) / SR) * .3
    e = np.linspace(0, 1, n) ** 2
    x = (x + tone) * e
    x[-int(SR * .006):] *= np.linspace(1, 0, int(SR * .006))
    return norm(x, -5)


def flash(rng):
    """Flash lumineux : transitoire clair + souffle aigu bref (accompagne un flash plein cadre)."""
    d = .35; tt = t(d)
    x = bandpass_sweep(rng.standard_normal(len(tt)), 9000, 2500, q=1.5) * np.exp(-tt * 10)
    x += np.sin(2 * np.pi * 3000 * tt) * np.exp(-tt * 60) * .4
    return fade(norm(x, -7))


GEN = {
    "pop": pop, "click": click, "tick": tick, "whoosh_in": lambda r: whoosh(r),
    "whoosh_out": lambda r: whoosh(r, rev=True), "swish": lambda r: whoosh(r, d=.14),
    "sub_hit": sub_hit, "riser": riser, "blip_up": lambda r: blip(r, True),
    "blip_down": lambda r: blip(r, False), "glitch": glitch, "shimmer": shimmer, "typewriter": typewriter,
    "whip": whip, "neon_flicker": neon_flicker, "heartbeat": heartbeat, "boom": boom, "zoom_in": zoom_in, "flash": flash,
}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("out"); p.add_argument("--seed", type=int, default=1); p.add_argument("--variants", type=int, default=3)
    p.add_argument("--only", nargs="*")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for name, fn in GEN.items():
        if a.only and name not in a.only: continue
        for v in range(a.variants):
            rng = np.random.default_rng(a.seed * 1000 + v)
            x = fn(rng).astype(np.float32)
            sf.write(f"{a.out}/{name}_{v + 1:02d}.wav", x, SR, subtype="PCM_24")
            print(f"{name}_{v + 1:02d}.wav  {len(x) / SR:.2f}s")


if __name__ == "__main__":
    main()
