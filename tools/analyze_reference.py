#!/usr/bin/env python3
"""Analyse technique d'une vidéo de référence.

Produit dans <out_dir>/ :
  metadata.json      FPS, résolution, durée, codecs
  scenes.json        coupes détectées (PySceneDetect, ContentDetector)
  motion.csv         énergie de mouvement image par image (diff. absolue moyenne)
  audio.json         onsets (SFX / impacts), loudness RMS, tempo estimé
  palette.json       palette dominante (k-means sur images échantillonnées)
  contact_sheet.jpg  planche contact (1 image / intervalle)
  frames/            1 image au milieu de chaque scène + images à pas fixe
  timeline.png       courbe mouvement + audio + coupes (vue synthétique)

Usage : python3 tools/analyze_reference.py video.mp4 out_dir [--step 0.5]
"""
import argparse, json, os, subprocess, csv
import numpy as np
import cv2


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout


def metadata(path):
    j = json.loads(sh(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path]))
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    a = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    w, h = int(v["width"]), int(v["height"])
    return {
        "duration_s": round(float(j["format"]["duration"]), 3),
        "fps": round(num / den, 3), "width": w, "height": h,
        "aspect": f"{w // np.gcd(w, h)}:{h // np.gcd(w, h)}",
        "orientation": "vertical" if h > w else "horizontal",
        "video_codec": v["codec_name"],
        "audio": None if not a else {"codec": a["codec_name"], "sr": int(a["sample_rate"]), "channels": a["channels"]},
    }


def scenes(path, threshold):
    from scenedetect import detect, ContentDetector
    out = []
    for s, e in detect(path, ContentDetector(threshold=threshold, min_scene_len=4)):
        out.append({"start": round(s.get_seconds(), 3), "end": round(e.get_seconds(), 3),
                    "start_frame": s.get_frames(), "end_frame": e.get_frames()})
    return out


def motion_and_frames(path, out, step, scene_list):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    mids = {int((s["start_frame"] + s["end_frame"]) / 2): i for i, s in enumerate(scene_list)}
    step_f = max(1, int(round(step * fps)))
    os.makedirs(f"{out}/frames", exist_ok=True)
    prev, rows, sheet, samples, idx = None, [], [], [], 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        small = cv2.resize(fr, (160, int(160 * fr.shape[0] / fr.shape[1])))
        g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)
        diff = 0.0 if prev is None else float(np.mean(np.abs(g - prev)))
        rows.append((idx, round(idx / fps, 3), round(diff, 3), round(float(g.mean()), 2)))
        prev = g
        if idx in mids:
            cv2.imwrite(f"{out}/frames/scene{mids[idx]:02d}_{idx / fps:06.2f}s.jpg", fr)
        if idx % step_f == 0:
            sheet.append((idx / fps, fr.copy()))
            samples.append(small)
        idx += 1
    with open(f"{out}/motion.csv", "w", newline="") as f:
        w = csv.writer(f); w.writerow(["frame", "t", "motion", "luma"]); w.writerows(rows)
    return rows, sheet, samples, fps


def contact_sheet(sheet, out, cols=8, tw=240):
    if not sheet:
        return
    h, w = sheet[0][1].shape[:2]
    th = int(tw * h / w)
    rows = (len(sheet) + cols - 1) // cols
    canvas = np.full((rows * (th + 18), cols * tw, 3), 20, np.uint8)
    for i, (t, fr) in enumerate(sheet):
        r, c = divmod(i, cols)
        y, x = r * (th + 18), c * tw
        canvas[y:y + th, x:x + tw] = cv2.resize(fr, (tw, th))
        cv2.putText(canvas, f"{t:05.2f}s", (x + 4, y + th + 14), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (230, 230, 230), 1)
    cv2.imwrite(f"{out}/contact_sheet.jpg", canvas, [cv2.IMWRITE_JPEG_QUALITY, 85])


def palette(samples, k=8):
    px = np.concatenate([s.reshape(-1, 3) for s in samples]).astype(np.float32)
    px = px[np.random.default_rng(0).choice(len(px), min(len(px), 60000), replace=False)]
    _, labels, centers = cv2.kmeans(px, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3, cv2.KMEANS_PP_CENTERS)
    counts = np.bincount(labels.ravel(), minlength=k) / len(labels)
    order = np.argsort(-counts)
    return [{"hex": "#%02x%02x%02x" % tuple(int(v) for v in centers[i][::-1]), "share": round(float(counts[i]), 3)} for i in order]


def audio(path, out):
    import librosa
    wav = f"{out}/audio.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path, "-ac", "1", "-ar", "22050", wav], check=True)
    y, sr = librosa.load(wav, sr=22050)
    hop = 512
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, units="time", backtrack=False)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, hop_length=hop, units="time")
    strength = {round(float(o), 3): float(onset_env[min(len(onset_env) - 1, librosa.time_to_frames(o, sr=sr, hop_length=hop))]) for o in onsets}
    top = sorted(strength.items(), key=lambda kv: -kv[1])[:25]
    cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9)
    silences = []
    quiet = db < (db.max() - 40)
    start = None
    for i, q in enumerate(quiet):
        if q and start is None: start = i
        if (not q or i == len(quiet) - 1) and start is not None:
            if t[i] - t[start] > 0.25: silences.append([round(float(t[start]), 2), round(float(t[i]), 2)])
            start = None
    res = {
        "tempo_bpm": round(float(np.atleast_1d(tempo)[0]), 1),
        "beats": [round(float(b), 3) for b in beats],
        "onsets": [round(float(o), 3) for o in onsets],
        "strongest_onsets": sorted([{"t": k, "strength": round(v, 2)} for k, v in top], key=lambda d: d["t"]),
        "rms_db_peak": round(float(db.max()), 1), "rms_db_mean": round(float(db.mean()), 1),
        "silences": silences,
        "centroid_hz_mean": round(float(cent.mean())),
    }
    os.remove(wav)
    return res, (t, rms, onset_env)


def timeline_png(rows, aud, scene_list, out):
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    tt = [r[1] for r in rows]; mv = [r[2] for r in rows]
    fig, ax = plt.subplots(2, 1, figsize=(16, 5), sharex=True)
    ax[0].plot(tt, mv, lw=0.8, color="#ff5a36"); ax[0].set_ylabel("mouvement")
    if aud:
        t, rms, oe = aud
        ax[1].plot(t, rms / rms.max(), lw=0.8, color="#2a7fff", label="RMS")
        ax[1].plot(t[:len(oe)], oe / oe.max(), lw=0.5, color="#999", label="onset")
        ax[1].legend(loc="upper right")
    for s in scene_list:
        for a in ax: a.axvline(s["start"], color="k", lw=0.6, alpha=0.5)
    ax[1].set_xlabel("secondes"); fig.tight_layout(); fig.savefig(f"{out}/timeline.png", dpi=90); plt.close(fig)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video"); p.add_argument("out")
    p.add_argument("--step", type=float, default=0.5, help="pas de la planche contact (s)")
    p.add_argument("--threshold", type=float, default=27.0, help="seuil ContentDetector")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    meta = metadata(a.video)
    sc = scenes(a.video, a.threshold)
    rows, sheet, samples, fps = motion_and_frames(a.video, a.out, a.step, sc)
    contact_sheet(sheet, a.out)
    pal = palette(samples)
    aud_res, aud_raw = (None, None)
    if meta["audio"]:
        aud_res, aud_raw = audio(a.video, a.out)
    timeline_png(rows, aud_raw, sc, a.out)
    mv = np.array([r[2] for r in rows])
    meta["motion"] = {"mean": round(float(mv.mean()), 2), "p95": round(float(np.percentile(mv, 95)), 2),
                      "static_ratio": round(float((mv < 0.5).mean()), 3)}
    meta["n_scenes"] = len(sc)
    meta["avg_shot_s"] = round(meta["duration_s"] / max(1, len(sc)), 2)
    for name, obj in [("metadata", meta), ("scenes", sc), ("palette", pal), ("audio", aud_res)]:
        with open(f"{a.out}/{name}.json", "w") as f: json.dump(obj, f, indent=2, ensure_ascii=False)
    print(json.dumps({"meta": meta, "palette": pal[:5], "audio": {k: aud_res[k] for k in ("tempo_bpm", "rms_db_peak", "silences")} if aud_res else None}, ensure_ascii=False))


if __name__ == "__main__":
    main()
