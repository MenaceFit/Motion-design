#!/usr/bin/env python3
"""Mix voix + musique + SFX → master stéréo 48 kHz.

- Ducking (sidechain) : la musique baisse automatiquement quand la voix parle
  (attaque 15 ms, relâchement 300 ms, profondeur réglable).
- SFX placés à la milliseconde depuis un JSON [{"src": "chemin.wav", "at": s, "volume": 0..1}].
- Bus master : compression douce + limiteur. La loudness finale (-14 LUFS) est faite par finish.sh.

Usage : python3 tools/mix_audio.py out.wav --voice voice.wav --music music.wav --sfx sfx.json
        [--music-db -16] [--duck-db 9] [--duration 42.5]
"""
import argparse, json
import numpy as np
import soundfile as sf
from pedalboard import Pedalboard, Compressor, Limiter, HighpassFilter

SR = 48000


def load(path, stereo=True):
    x, sr = sf.read(path, always_2d=True)
    x = x.T.astype(np.float32)
    if sr != SR:
        import librosa
        x = np.stack([librosa.resample(c, orig_sr=sr, target_sr=SR) for c in x])
    if stereo and x.shape[0] == 1: x = np.repeat(x, 2, 0)
    return x


def envelope(mono, attack=0.015, release=0.30):
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    e = np.abs(mono); out = np.empty_like(e); acc = 0.0
    for i, v in enumerate(e):
        c = a if v > acc else r
        acc = c * acc + (1 - c) * v
        out[i] = acc
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("--voice"); ap.add_argument("--music"); ap.add_argument("--sfx")
    ap.add_argument("--music-db", type=float, default=-15.0, help="niveau musique sans voix")
    ap.add_argument("--duck-db", type=float, default=9.0, help="atténuation supplémentaire sous la voix")
    ap.add_argument("--duration", type=float)
    a = ap.parse_args()

    tracks = {}
    if a.voice: tracks["voice"] = load(a.voice)
    if a.music: tracks["music"] = load(a.music)
    n = int(a.duration * SR) if a.duration else max(t.shape[1] for t in tracks.values())
    fit = lambda x: np.pad(x, ((0, 0), (0, max(0, n - x.shape[1]))))[:, :n]
    mix = np.zeros((2, n), np.float32)

    if "voice" in tracks:
        v = fit(tracks["voice"])
        mix += v
    if "music" in tracks:
        m = fit(tracks["music"]) * 10 ** (a.music_db / 20)
        if "voice" in tracks:
            env = envelope(v.mean(0))
            env = env / (env.max() + 1e-9)
            duck = 10 ** (-a.duck_db * np.clip(env * 4, 0, 1) / 20)  # voix présente → -duck_db
            m *= duck[None, :]
        mix += m
    if a.sfx:
        for s in json.load(open(a.sfx)):
            x = load(s["src"]) * s.get("volume", 0.5)
            i = int(max(0, s["at"]) * SR)
            if i >= n: continue
            j = min(n, i + x.shape[1]); mix[:, i:j] += x[:, :j - i]
    master = Pedalboard([HighpassFilter(25), Compressor(threshold_db=-12, ratio=2, attack_ms=10, release_ms=120), Limiter(threshold_db=-1.5)])
    mix = master(mix, SR)
    sf.write(a.out, mix.T, SR, subtype="PCM_24")
    print(f"master {n / SR:.2f}s → {a.out}")


if __name__ == "__main__":
    main()
