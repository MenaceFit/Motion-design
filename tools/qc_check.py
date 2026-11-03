#!/usr/bin/env python3
"""Contrôle qualité automatique d'un export vidéo.

Vérifie : format (résolution/FPS/codec/pix_fmt), frames noires, images figées,
loudness (LUFS intégré + true peak), silences, et — si un fichier de timings est
fourni — l'écart entre chaque transitoire audio et l'événement visuel attendu.

Usage :
  python3 tools/qc_check.py export.mp4 [--target 1080x1920] [--fps 30]
                            [--lufs -14] [--events words.json]
Sortie : rapport lisible + code retour 1 si un contrôle bloquant échoue.
"""
import argparse, json, re, subprocess, sys


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stderr


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path],
                         capture_output=True, text=True).stdout
    return json.loads(out)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video"); p.add_argument("--target", default="1080x1920"); p.add_argument("--fps", type=float, default=30)
    p.add_argument("--lufs", type=float, default=-14.0); p.add_argument("--events", help="JSON [{start: s}] des mots/impacts")
    p.add_argument("--allow-black-tail", type=float, default=0.0, help="noir autorisé en fin (s)")
    a = p.parse_args()
    fails, warns, info = [], [], []

    j = probe(a.video)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    au = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    dur = float(j["format"]["duration"])
    num, den = map(int, v["r_frame_rate"].split("/"))
    res = f'{v["width"]}x{v["height"]}'
    info.append(f"Durée {dur:.2f}s · {res} · {num / den:.2f} fps · {v['codec_name']} {v.get('pix_fmt')} · audio={'oui' if au else 'NON'}")
    if res != a.target: fails.append(f"Résolution {res} ≠ {a.target}")
    if abs(num / den - a.fps) > 0.01: fails.append(f"FPS {num / den:.2f} ≠ {a.fps}")
    if v.get("pix_fmt") != "yuv420p": warns.append(f"pix_fmt {v.get('pix_fmt')} (yuv420p recommandé pour compatibilité)")
    if not au: warns.append("Pas de piste audio")

    # Frames noires
    bd = run(["ffmpeg", "-hide_banner", "-i", a.video, "-vf", "blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-"])
    for m in re.finditer(r"black_start:([\d.]+) black_end:([\d.]+)", bd):
        s, e = float(m.group(1)), float(m.group(2))
        if s > 0.05 and not (e >= dur - 0.05 and dur - s <= a.allow_black_tail):
            warns.append(f"Noir {s:.2f}→{e:.2f}s (vérifier si volontaire)")
    # Images figées (> 1,5 s)
    fd = run(["ffmpeg", "-hide_banner", "-i", a.video, "-vf", "freezedetect=n=0.001:d=1.5", "-an", "-f", "null", "-"])
    for m in re.finditer(r"freeze_start: ([\d.]+)", fd):
        warns.append(f"Image figée ≥1,5 s à {float(m.group(1)):.2f}s (rythme short-form : risque de décrochage)")

    if au:
        lo = run(["ffmpeg", "-hide_banner", "-i", a.video, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
        I = re.findall(r"I:\s+(-?[\d.]+) LUFS", lo); TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lo)
        if I:
            i_val = float(I[-1]); tp = float(TP[-1]) if TP else 0
            info.append(f"Loudness {i_val:.1f} LUFS · true peak {tp:.1f} dBTP")
            if abs(i_val - a.lufs) > 2: warns.append(f"Loudness {i_val:.1f} LUFS (cible {a.lufs}) → passer tools/finish.sh")
            if tp > -1.0: fails.append(f"True peak {tp:.1f} dBTP > -1 dBTP (risque de saturation après transcodage plateforme)")
        sd = run(["ffmpeg", "-hide_banner", "-i", a.video, "-af", "silencedetect=n=-50dB:d=0.8", "-vn", "-f", "null", "-"])
        for m in re.finditer(r"silence_start: ([\d.]+)", sd):
            warns.append(f"Silence ≥0,8 s à {float(m.group(1)):.2f}s")

        if a.events:
            import numpy as np, librosa
            ev = [e["start"] for e in json.load(open(a.events))]
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", a.video, "-ac", "1", "-ar", "22050", "/tmp/_qc.wav"], check=True)
            y, sr = librosa.load("/tmp/_qc.wav", sr=22050)
            on = librosa.onset.onset_detect(y=y, sr=sr, units="time", hop_length=256, backtrack=True)
            off = []
            for e in ev:
                d = on - e
                k = int(np.argmin(np.abs(d))) if len(on) else None
                off.append(None if k is None else float(d[k]))
            ms = [round(o * 1000) for o in off if o is not None]
            bad = [(ev[i], m) for i, m in enumerate(ms) if abs(m) > 50]
            info.append(f"Synchro A/V : décalage médian {int(np.median(ms))} ms, max {max(map(abs, ms))} ms sur {len(ms)} événements")
            for t0, m in bad: warns.append(f"Événement {t0:.2f}s : transitoire audio à {m:+d} ms (> ±50 ms)")

    print("== QC", a.video)
    for x in info: print("  ·", x)
    for x in warns: print("  ⚠", x)
    for x in fails: print("  ✗", x)
    print("  RÉSULTAT :", "ÉCHEC" if fails else ("OK avec avertissements" if warns else "OK"))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
