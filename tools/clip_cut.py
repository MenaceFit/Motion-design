#!/usr/bin/env python3
"""Découpe un plan de footage en clip vertical 1080×1920 prêt pour Remotion.

- Vidéo 16:9 : fenêtre 9:16 pleine hauteur qui glisse de focus[0] à focus[1] (index de footage_index.py).
  Source 4K → fenêtre 1215×2160 → 1080×1920 : aucun upscale.
- Vidéo verticale/haute : fenêtre centrée.
- Image fixe : Ken Burns (zoom 1 → 1,12 vers le point d'intérêt, sous-pixel).
- Étalonnage « punchy » léger (contraste, saturation, netteté) — désactivable.
- Transitions **cuites** (OpenCV) : en tête (head) et en queue (tail) du clip :
    zoom    flou radial + zoom (tête : 1,28 → 1 ; queue : 1 → 1,28) — l'ouverture des refs (6 frames)
    whip_l / whip_r   filé horizontal + glissement (tête : arrive de côté ; queue : part de côté)
    none
  Un cut « queue zoom » + « tête zoom » = transition zoom-blur continue des refs.
- Aucun son (l'audio des trailers contient de la musique sous licence).

Usage :
  python3 tools/clip_cut.py --src footage/raw/gta6/GTAVI_Trailer_1.mp4 --start 12.3 --dur 1.6 \
      --focus 0.42 0.55 --head zoom --tail none --out clip.mp4
  python3 tools/clip_cut.py --spec clips.json      # liste [{src,start,dur,focus,head,tail,out,...}], en parallèle
"""
import argparse, json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
import cv2

W, H, FPS = 1080, 1920, 30
GRADE = "eq=contrast=1.07:saturation=1.14:gamma=0.98,unsharp=5:5:0.55"


def probe(src):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                   "-of", "json", str(src)], capture_output=True, text=True).stdout)["streams"][0]
    return j["width"], j["height"]


def ease_out(t):
    return 1 - (1 - t) ** 3


def zoom_blur(img, scale, strength, k=9):
    """Flou radial : moyenne de k copies zoomées entre scale et scale*(1+strength)."""
    if strength < 0.004 and abs(scale - 1) < 0.002:
        return img
    acc = np.zeros(img.shape, np.float32)
    c = (W / 2, H / 2)
    for i in range(k):
        s = scale * (1 + strength * i / max(1, k - 1))
        M = cv2.getRotationMatrix2D(c, 0, s)
        acc += cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (acc / k).astype(np.uint8)


def whip(img, k, d, blur=210):
    """Filé horizontal sans bord visible : zoom (1+0,3k) + décalage interne ≤ marge + flou directionnel.
    k ∈ [0,1] intensité, d = +1/-1 sens du mouvement."""
    if k < 0.01:
        return img
    s = 1 + 0.30 * k
    shift = d * k * (s - 1) / 2 * W * 0.95
    M = np.float32([[s, 0, (1 - s) * W / 2 + shift], [0, s, (1 - s) * H / 2]])
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    L = int(blur * k)
    if L > 2:
        kern = np.full((1, L), 1 / L, np.float32)
        out = cv2.filter2D(out, -1, kern, borderType=cv2.BORDER_REPLICATE)
    return out


def apply_transitions(frames, head, tail, n_head=6, n_tail=5):
    n = len(frames)
    for i in range(min(n_head, n)):
        k = 1 - ease_out((i + 1) / (n_head + 1))  # 1 → 0
        if head == "zoom":
            frames[i] = zoom_blur(frames[i], 1 + 0.28 * k, 0.32 * k)
        elif head in ("whip_l", "whip_r"):
            d = 1 if head == "whip_r" else -1  # whip_r : l'image arrive par la droite
            frames[i] = whip(frames[i], k, d)
    for j in range(min(n_tail, n)):
        i = n - n_tail + j
        if i < 0: continue
        k = ease_out((j + 1) / n_tail) ** 1.5  # 0 → 1
        if tail == "zoom":
            frames[i] = zoom_blur(frames[i], 1 + 0.22 * k, 0.30 * k)
        elif tail in ("whip_l", "whip_r"):
            d = -1 if tail == "whip_l" else 1  # whip_l : l'image part vers la gauche
            frames[i] = whip(frames[i], k, d)
    return frames


def read_video(src, start, dur, focus, speed, grade):
    sw, sh = probe(src)
    src_dur = dur * speed
    if sw / sh > W / H + 0.01:  # plus large que 9:16 → fenêtre horizontale glissante
        cw = int(round(sh * W / H / 2)) * 2
        x0 = focus[0] * sw - cw / 2; x1 = focus[-1] * sw - cw / 2
        crop = f"crop={cw}:{sh}:'max(0,min(iw-ow,{x0:.1f}+({x1 - x0:.1f})*t/{src_dur:.3f}))':0"
    else:  # plus haut que 9:16 → fenêtre verticale centrée
        ch = int(round(sw * H / W / 2)) * 2
        crop = f"crop={sw}:{ch}:0:(ih-oh)/2"
    vf = f"{crop},scale={W}:{H}:flags=lanczos,setpts=PTS/{speed},fps={FPS}" + (f",{GRADE}" if grade else "")
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{src_dur:.3f}", "-i", str(src), "-an", "-vf", vf,
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    frames = list(np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).copy())
    need = int(round(dur * FPS))
    while len(frames) < need and frames: frames.append(frames[-1].copy())  # complète si la source est courte
    return frames[:need]


def read_still(src, dur, focus, zoom=(1.0, 1.12), grade=True):
    img = cv2.imread(str(src))
    sh, sw = img.shape[:2]
    if grade:
        img = cv2.convertScaleAbs(img, alpha=1.06, beta=-4)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.12, 0, 255)
        img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    base_h = sh if sw / sh > W / H else sw * H / W
    n = int(round(dur * FPS)); out = []
    for i in range(n):
        t = i / max(1, n - 1)
        z = zoom[0] + (zoom[1] - zoom[0]) * (t * t * (3 - 2 * t))
        ch = base_h / z; cw = ch * W / H
        cx = (focus[0] + (focus[-1] - focus[0]) * t) * sw
        cx = min(sw - cw / 2, max(cw / 2, cx)); cy = sh / 2
        s = W / cw
        M = np.float32([[s, 0, -(cx - cw / 2) * s], [0, s, -(cy - ch / 2) * s]])
        out.append(cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT))
    return out


def write(frames, out):
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
                          "-g", "15", "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    if p.returncode: raise RuntimeError(f"encodage échoué : {out}")


def cut(spec):
    src = spec["src"]; dur = float(spec["dur"]); focus = spec.get("focus", [0.5, 0.5])
    if Path(src).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        frames = read_still(src, dur, focus, tuple(spec.get("zoom", (1.0, 1.12))), spec.get("grade", True))
    else:
        frames = read_video(src, float(spec.get("start", 0)), dur, focus, float(spec.get("speed", 1.0)), spec.get("grade", True))
    if not frames: raise RuntimeError(f"aucune image lue : {src} @ {spec.get('start')}")
    frames = apply_transitions(frames, spec.get("head", "none"), spec.get("tail", "none"))
    write(frames, spec["out"])
    return spec["out"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec"); ap.add_argument("--src"); ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--dur", type=float, default=1.5); ap.add_argument("--focus", type=float, nargs="+", default=[0.5, 0.5])
    ap.add_argument("--head", default="none"); ap.add_argument("--tail", default="none"); ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--no-grade", action="store_true"); ap.add_argument("--out"); ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    specs = json.loads(Path(a.spec).read_text()) if a.spec else [dict(src=a.src, start=a.start, dur=a.dur, focus=a.focus, head=a.head,
                                                                         tail=a.tail, speed=a.speed, grade=not a.no_grade, out=a.out)]
    with ThreadPoolExecutor(a.jobs) as ex:
        for o in ex.map(cut, specs): print("✓", o)


if __name__ == "__main__":
    main()
