#!/usr/bin/env python3
"""Générateur de musique de fond procédurale — originale, libre de droits.

Ambiances (--mood) :
  dark      drone grave + nappe mineure lente (style « Minimal Line », réflexion, dev perso)
  hype      808 glissé + charleys en triolets + clap + nappe (énergie, faits choc, « tu savais que »)
  inspire   arpèges pluck + nappe + kick doux (motivation, conclusion positive)
  tension   pulsation grave + ostinato + risers (mystère, révélation)

Structure : intro filtrée → (riser) → DROP au temps --drop → corps → fin.
Sortie : music.wav (48 kHz stéréo) + music.json (BPM, temps, mesures, drop) pour caler les coupes
sur la musique.

Usage : python3 tools/music_gen.py out.wav --mood hype --bpm 120 --duration 45 --drop 3.2 --seed 7
"""
import argparse, json
import numpy as np
from pedalboard import Pedalboard, Reverb, LowpassFilter, HighpassFilter, Compressor, Chorus, Distortion, Limiter, Gain

SR = 48000
KEYS = {"A": 57, "C": 60, "D": 62, "E": 64, "F": 65, "G": 55}
# progressions mineures éprouvées (degrés en demi-tons depuis la tonique)
PROGS = {
    "dark": [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]],        # i – VI – VII – v
    "hype": [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]],       # i – VI – III – VII
    "inspire": [[-4, 0, 3], [-9, -5, -2], [-2, 2, 5], [0, 3, 7]],    # VI – III – VII – i
    "tension": [[0, 3, 7], [1, 4, 8], [0, 3, 7], [-1, 3, 6]],        # i – bII – i – vii°
}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(f, n, rng, detune=0.0):
    ph = rng.uniform(0, 1)
    t = np.arange(n) / SR
    x = 2 * ((t * f * (1 + detune) + ph) % 1) - 1
    return x


def env(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    an, rn = min(n, int(a * SR)), min(n, int(r * SR))
    e[:an] = np.linspace(0, sustain, an)
    if rn: e[-rn:] *= np.linspace(1, 0, rn)
    return e


def place(buf, x, start, gain=1.0):
    i = int(start * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[:j - i] * gain


def pad_chord(notes, dur, rng):
    n = int(dur * SR)
    x = sum(saw(mtof(m), n, rng, d) for m in notes for d in (-0.004, 0.0, 0.005)) / (3 * len(notes))
    return x * env(n, min(0.6, dur * 0.3), min(0.8, dur * 0.3))


def pluck(f, dur, rng):  # Karplus-Strong
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * env(n, 0.002, 0.05)


def kick(rng, punch=1.0):
    t = np.arange(int(0.45 * SR)) / SR
    f = 45 + 120 * np.exp(-t * 35)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    x[:200] += rng.uniform(-1, 1, 200) * 0.3 * punch
    return np.tanh(1.5 * x)


def k808(f0, dur, glide_from=None):
    t = np.arange(int(dur * SR)) / SR
    f = np.full_like(t, f0)
    if glide_from: f = f0 + (glide_from - f0) * np.exp(-t * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.08)
    return np.tanh(2.2 * x)


def noise_hit(rng, dur, decay):
    n = int(dur * SR)
    return rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / (SR * decay))


def fx(x, board):
    return board(x.astype(np.float32)[None, :], SR)[0]


def render(mood, bpm, duration, drop, seed, key):
    rng = np.random.default_rng(seed)
    beat = 60 / bpm; bar = 4 * beat
    n = int(duration * SR)
    root = KEYS[key]
    prog = PROGS[mood]
    L = {k: np.zeros(n) for k in ("pad", "bass", "drums", "lead", "fx")}
    nbars = int(np.ceil(duration / bar)) + 1
    drop = drop if drop is not None else 2 * bar
    drop = round(drop / beat) * beat  # aligner le drop sur un temps

    for b in range(nbars):
        t0 = b * bar
        ch = [root + d for d in prog[b % len(prog)]]
        L["pad"][int(t0 * SR):][:0]  # noop (lisibilité)
        place(L["pad"], pad_chord([m - 12 for m in ch] + [ch[0]], bar + 0.4, rng), t0, 0.5)
        if mood in ("dark", "tension"):
            place(L["bass"], np.sin(2 * np.pi * mtof(ch[0] - 24) * np.arange(int(bar * SR)) / SR) * env(int(bar * SR), 0.3, 0.3), t0, 0.55)
        for s in range(16):  # pas de double-croche
            t = t0 + s * beat / 4
            if t >= duration: break
            after = t >= drop - 1e-6
            if mood == "hype" and after:
                if s in (0, 10): place(L["bass"], k808(mtof(ch[0] - 24), beat * 1.6, mtof(ch[0] - 12) if s == 10 else None), t, 0.75)
                if s in (0, 7, 10): place(L["drums"], kick(rng), t, 0.8)
                if s in (4, 12): place(L["drums"], fx(noise_hit(rng, 0.25, 0.05), Pedalboard([HighpassFilter(900), Reverb(room_size=0.3, wet_level=0.25)])), t, 0.5)
                if s % 2 == 0 or (b % 2 and s in (13, 15)):
                    place(L["drums"], fx(noise_hit(rng, 0.05, 0.008), Pedalboard([HighpassFilter(7000)])), t, 0.22 if s % 4 else 0.3)
            if mood == "inspire":
                if after and s in (0, 8): place(L["drums"], kick(rng, 0.5), t, 0.55)
                if after and s in (4, 12): place(L["drums"], fx(noise_hit(rng, 0.2, 0.04), Pedalboard([HighpassFilter(1500)])), t, 0.25)
                if s % 2 == 0:
                    arp = [ch[0], ch[1], ch[2], ch[1] + 12][(s // 2) % 4]
                    place(L["lead"], pluck(mtof(arp + 12), beat * 0.9, rng), t, 0.32 if after else 0.18)
                if after and s == 0: place(L["bass"], k808(mtof(ch[0] - 24), bar * 0.95), t, 0.45)
            if mood == "tension":
                if s % 4 == 0: place(L["bass"], k808(mtof(ch[0] - 24), beat * 0.5), t, 0.5 if after else 0.3)
                if after and s % 2 == 1: place(L["lead"], pluck(mtof(ch[(s // 2) % 3] + 24), beat * 0.4, rng), t, 0.18)
                if after and s in (0, 8): place(L["drums"], kick(rng, 0.7), t, 0.6)
            if mood == "dark" and after and s == 0 and b % 2 == 0:
                place(L["drums"], kick(rng, 0.3), t, 0.35)

    # riser avant le drop + impact
    if drop > 1.0:
        rl = min(drop, 2 * beat * 2)
        tt = np.arange(int(rl * SR)) / SR
        r = rng.uniform(-1, 1, len(tt)) * (tt / rl) ** 2.5
        place(L["fx"], fx(r, Pedalboard([HighpassFilter(600), LowpassFilter(9000)])), drop - rl, 0.35)
        place(L["fx"], kick(rng, 1.0), drop, 0.6)

    # traitement par piste (pedalboard)
    pad = fx(L["pad"], Pedalboard([HighpassFilter(170), LowpassFilter(2200 if mood != "hype" else 3200), Chorus(rate_hz=0.3, depth=0.3, mix=0.4), Reverb(room_size=0.85, wet_level=0.45, dry_level=0.6)]))
    lead = fx(L["lead"], Pedalboard([Reverb(room_size=0.6, wet_level=0.3)]))
    bass = fx(L["bass"], Pedalboard([LowpassFilter(400), Distortion(drive_db=4)]))
    drums = fx(L["drums"], Pedalboard([Compressor(threshold_db=-14, ratio=3, attack_ms=5, release_ms=80)]))
    # intro filtrée : passe-bas qui s'ouvre jusqu'au drop
    pre = int(drop * SR)
    if pre > SR // 4:
        filt = fx(pad[:pre], Pedalboard([LowpassFilter(700)]))
        fade = np.linspace(0, 1, pre)
        pad[:pre] = filt * (1 - fade) + pad[:pre] * fade
    mix = 0.55 * pad + 0.42 * bass + 0.7 * drums + 0.6 * lead + 0.6 * L["fx"]
    # stéréo : léger décalage (Haas) sur pad/lead
    d = int(0.011 * SR)
    left = mix
    right = 0.55 * np.pad(pad, (d, 0))[:n] + 0.42 * bass + 0.7 * drums + 0.6 * np.pad(lead, (d, 0))[:n] + 0.6 * L["fx"]
    st = np.stack([left, right]).astype(np.float32)
    st = Pedalboard([HighpassFilter(30), Compressor(threshold_db=-16, ratio=2.5, attack_ms=20, release_ms=200), Gain(4), Limiter(threshold_db=-1.5)])(st, SR)
    fade_n = int(1.2 * SR); st[:, -fade_n:] *= np.linspace(1, 0, fade_n)
    # sécurité : crête échantillon à -3 dBFS (le mix final repasse par tools/mix_audio.py + finish.sh)
    st = st / (np.abs(st).max() + 1e-9) * 10 ** (-3 / 20)
    beats = [round(i * beat, 4) for i in range(int(duration / beat) + 1)]
    return st, {"bpm": bpm, "beat_s": beat, "bar_s": bar, "drop": drop, "beats": beats,
                "bars": [round(i * bar, 4) for i in range(int(duration / bar) + 1)], "mood": mood, "key": key, "seed": seed}


def main():
    import soundfile as sf
    p = argparse.ArgumentParser()
    p.add_argument("out"); p.add_argument("--mood", default="hype", choices=list(PROGS))
    p.add_argument("--bpm", type=float, default=120); p.add_argument("--duration", type=float, default=30)
    p.add_argument("--drop", type=float); p.add_argument("--seed", type=int, default=1)
    p.add_argument("--key", default="A", choices=list(KEYS))
    a = p.parse_args()
    st, meta = render(a.mood, a.bpm, a.duration, a.drop, a.seed, a.key)
    sf.write(a.out, st.T, SR, subtype="PCM_24")
    json.dump(meta, open(a.out.rsplit(".", 1)[0] + ".json", "w"), indent=1)
    print(f"{a.out}  {a.mood} {a.bpm} BPM  drop={meta['drop']:.2f}s")


if __name__ == "__main__":
    main()
