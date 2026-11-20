#!/usr/bin/env python3
"""Découpe un plan de footage en clip vertical 1080×1920 (30 ou 60 i/s) prêt pour Remotion.

- Vidéo 16:9 : fenêtre 9:16 pleine hauteur qui glisse de focus[0] à focus[1] (index de footage_index.py).
  Source 4K → fenêtre 1215×2160 → 1080×1920 : aucun upscale.
- Vidéo verticale/haute : fenêtre centrée. Image fixe : Ken Burns sous-pixel.
- Étalonnage « punchy » léger (contraste, saturation, netteté).
- **60 i/s** : la source 30 i/s est remappée dans le temps ; les images intermédiaires sont dupliquées
  en vitesse normale et **mélangées** pendant les accélérations (= flou de bougé naturel).
- **Speed ramp** : `ramp_out` accélère jusqu'à ×3 sur les dernières 0,28 s (vers la coupe),
  `ramp_in` part de ×3 et revient à ×1 en 0,22 s (après la coupe).
- Transitions **cuites** en tête (head) / queue (tail) :
    zoom              flou radial + zoom (tête 1,28 → 1 ; queue 1 → 1,22)
    whip_l / whip_r   filé horizontal (whip_l : l'image part vers la gauche ; whip_r : arrive par la droite)
    whip_u / whip_d   filé vertical (whip_u : part vers le haut ; whip_d : arrive par le bas)
    spin_l / spin_r   rotation floutée ±28° + zoom
    glitch            décalage RVB + tranches déplacées
    none
- Aucun son (l'audio des trailers contient de la musique sous licence).

Usage :
  python3 tools/clip_cut.py --src footage/raw/gta6/GTAVI_Trailer_1.mp4 --start 12.3 --dur 1.6 \
      --focus 0.42 0.55 --head zoom --tail whip_l --ramp-out --fps 60 --out clip.mp4
  python3 tools/clip_cut.py --spec clips.json      # liste [{src,start,dur,focus,head,tail,fps,ramp_in,ramp_out,out}]
"""
import argparse, json, subprocess, zlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
import cv2

W, H, SRC_FPS = 1080, 1920, 30
GRADE = "eq=contrast=1.07:saturation=1.14:gamma=0.98,unsharp=5:5:0.55"
HEAD_S, TAIL_S = 0.20, 0.17          # durée des transitions cuites
RAMP_OUT_S, RAMP_IN_S, RAMP_MAX = 0.28, 0.22, 3.0


def probe(src):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                   "-of", "json", str(src)], capture_output=True, text=True).stdout)["streams"][0]
    return j["width"], j["height"]


def ease_out(t):
    return 1 - (1 - t) ** 3


# ---------------------------------------------------------------- effets
def zoom_blur(img, scale, strength, k=9):
    if strength < 0.004 and abs(scale - 1) < 0.002:
        return img
    acc = np.zeros(img.shape, np.float32)
    for i in range(k):
        s = scale * (1 + strength * i / max(1, k - 1))
        M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, s)
        acc += cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (acc / k).astype(np.uint8)


def spin_blur(img, angle, k=7):
    """Rotation de `angle`° avec flou de rotation (copies entre angle·0,6 et angle), zoom anti-bords."""
    if abs(angle) < 0.3:
        return img
    s = 1.0 + 0.012 * abs(angle)
    acc = np.zeros(img.shape, np.float32)
    for i in range(k):
        a = angle * (0.6 + 0.4 * i / max(1, k - 1))
        M = cv2.getRotationMatrix2D((W / 2, H / 2), a, s)
        acc += cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (acc / k).astype(np.uint8)


def whip(img, k, d, axis=0, blur=210):
    """Filé sans bord visible : zoom interne + décalage ≤ marge + flou directionnel. axis 0 = horizontal."""
    if k < 0.01:
        return img
    s = 1 + 0.30 * k
    shift = d * k * (s - 1) / 2 * (W if axis == 0 else H) * 0.95
    tx, ty = (shift, 0) if axis == 0 else (0, shift)
    M = np.float32([[s, 0, (1 - s) * W / 2 + tx], [0, s, (1 - s) * H / 2 + ty]])
    out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    L = int(blur * k * (1 if axis == 0 else 1.4))
    if L > 2:
        kern = np.full((1, L) if axis == 0 else (L, 1), 1 / L, np.float32)
        out = cv2.filter2D(out, -1, kern, borderType=cv2.BORDER_REPLICATE)
    return out


def rgb_glitch(img, k, rng):
    """Décalage des canaux + tranches horizontales déplacées ; k ∈ [0,1]."""
    if k < 0.05:
        return img
    out = img.copy()
    dx = int(28 * k)
    out[..., 2] = np.roll(img[..., 2], dx, axis=1)
    out[..., 0] = np.roll(img[..., 0], -dx, axis=1)
    for _ in range(int(3 + 6 * k)):
        y0 = rng.integers(0, H - 40); h = int(rng.integers(12, 140)); sh = int(rng.integers(-90, 90) * k)
        out[y0:y0 + h] = np.roll(out[y0:y0 + h], sh, axis=1)
    return out


def apply_fx(frame, kind, k, d_sign, rng):
    """k ∈ [0,1] : intensité de la transition à cet instant."""
    if kind == "zoom_head": return zoom_blur(frame, 1 + 0.28 * k, 0.32 * k)
    if kind == "zoom_tail": return zoom_blur(frame, 1 + 0.22 * k, 0.30 * k)
    if kind.startswith("whip"):
        axis = 1 if kind[5] in "ud" else 0
        return whip(frame, k, d_sign, axis)
    if kind.startswith("spin"): return spin_blur(frame, 28 * k * d_sign)
    if kind == "glitch": return rgb_glitch(frame, k, rng)
    return frame


def transitions(frames, head, tail, fps, seed=0):
    n = len(frames); rng = np.random.default_rng(seed)
    nh, nt = int(round(HEAD_S * fps)), int(round(TAIL_S * fps))
    # sens : whip_l part vers la gauche (-1) ; whip_r arrive par la droite (+1 → 0) ; idem u/d
    sign = {"whip_l": -1, "whip_r": 1, "whip_u": -1, "whip_d": 1, "spin_l": 1, "spin_r": -1}
    if head and head != "none":
        for i in range(min(nh, n)):
            k = 1 - ease_out((i + 1) / (nh + 1))
            kind = "zoom_head" if head == "zoom" else head
            frames[i] = apply_fx(frames[i], kind, k if head != "glitch" else k * (rng.uniform() > 0.25), sign.get(head, 1), rng)
    if tail and tail != "none":
        for j in range(min(nt, n)):
            i = n - nt + j
            k = ease_out((j + 1) / nt) ** 1.5
            kind = "zoom_tail" if tail == "zoom" else tail
            frames[i] = apply_fx(frames[i], kind, k if tail != "glitch" else k * (rng.uniform() > 0.25), sign.get(tail, 1), rng)
    return frames


# ---------------------------------------------------------------- remappage temporel
def time_map(dur, fps, base, ramp_in, ramp_out):
    """Temps source (relatif, s) de chaque image de sortie + vitesse instantanée."""
    n = int(round(dur * fps)); tau = np.arange(n) / fps
    sp = np.full(n, base)
    if ramp_out:
        x = np.clip((tau - (dur - RAMP_OUT_S)) / RAMP_OUT_S, 0, 1)
        sp *= 1 + (RAMP_MAX - 1) * x ** 2
    if ramp_in:
        x = np.clip(tau / RAMP_IN_S, 0, 1)
        sp *= 1 + (RAMP_MAX - 1) * (1 - x) ** 2
    src = np.concatenate([[0], np.cumsum(sp[:-1] / fps)])
    return src, sp


def read_video(src, start, dur, focus, speed, grade, fps, ramp_in, ramp_out):
    sw, sh = probe(src)
    tmap, sp = time_map(dur, fps, speed, ramp_in, ramp_out)
    src_dur = float(tmap[-1] + sp[-1] / fps + 2 / SRC_FPS)
    if sw / sh > W / H + 0.01:
        cw = int(round(sh * W / H / 2)) * 2
        x0 = focus[0] * sw - cw / 2; x1 = focus[-1] * sw - cw / 2
        crop = f"crop={cw}:{sh}:'max(0,min(iw-ow,{x0:.1f}+({x1 - x0:.1f})*t/{src_dur:.3f}))':0"
    else:
        ch = int(round(sw * H / W / 2)) * 2
        crop = f"crop={sw}:{ch}:0:(ih-oh)/2"
    vf = f"fps={SRC_FPS},{crop},scale={W}:{H}:flags=lanczos" + (f",{GRADE}" if grade else "")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{src_dur:.3f}", "-i", str(src), "-an",
                          "-vf", vf, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
    srcf = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    if not len(srcf):
        return []
    out = []
    for t, v in zip(tmap, sp):
        p = t * SRC_FPS; i = int(p); a = p - i
        i = min(i, len(srcf) - 1); j = min(i + 1, len(srcf) - 1)
        if v * SRC_FPS / fps > 1.05 and j != i:  # accélération : mélange de 2–3 images = flou de bougé
            k = min(len(srcf) - 1, i + 2)
            out.append(((srcf[i].astype(np.uint16) + srcf[j] + srcf[k]) // 3).astype(np.uint8))
        else:
            out.append(srcf[i].copy())
    return out


def read_still(src, dur, focus, zoom, grade, fps):
    img = cv2.imread(str(src))
    sh, sw = img.shape[:2]
    if grade:
        img = cv2.convertScaleAbs(img, alpha=1.06, beta=-4)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.12, 0, 255)
        img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    base_h = sh if sw / sh > W / H else sw * H / W
    n = int(round(dur * fps)); out = []
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


def write(frames, out, fps):
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps),
                          "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
                          "-g", str(fps // 2), "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    if p.returncode: raise RuntimeError(f"encodage échoué : {out}")


def cut(spec):
    src = spec["src"]; dur = float(spec["dur"]); focus = spec.get("focus", [0.5, 0.5]); fps = int(spec.get("fps", 60))
    if Path(src).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        frames = read_still(src, dur, focus, tuple(spec.get("zoom", (1.0, 1.12))), spec.get("grade", True), fps)
    else:
        frames = read_video(src, float(spec.get("start", 0)), dur, focus, float(spec.get("speed", 1.0)), spec.get("grade", True),
                            fps, spec.get("ramp_in", False), spec.get("ramp_out", False))
    if not frames: raise RuntimeError(f"aucune image lue : {src} @ {spec.get('start')}")
    frames = transitions(frames, spec.get("head", "none"), spec.get("tail", "none"), fps, seed=zlib.crc32(str(spec["out"]).encode()))
    write(frames, spec["out"], fps)
    return spec["out"]


def source_span(spec):
    """Durée source consommée (s) — utilisé par gta_build.py pour choisir/centrer les plans."""
    tm, sp = time_map(float(spec["dur"]), int(spec.get("fps", 60)), float(spec.get("speed", 1.0)),
                      spec.get("ramp_in", False), spec.get("ramp_out", False))
    return float(tm[-1] + sp[-1] / int(spec.get("fps", 60)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec"); ap.add_argument("--src"); ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--dur", type=float, default=1.5); ap.add_argument("--focus", type=float, nargs="+", default=[0.5, 0.5])
    ap.add_argument("--head", default="none"); ap.add_argument("--tail", default="none"); ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--fps", type=int, default=60); ap.add_argument("--ramp-in", action="store_true"); ap.add_argument("--ramp-out", action="store_true")
    ap.add_argument("--no-grade", action="store_true"); ap.add_argument("--out"); ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    specs = json.loads(Path(a.spec).read_text()) if a.spec else [dict(
        src=a.src, start=a.start, dur=a.dur, focus=a.focus, head=a.head, tail=a.tail, speed=a.speed, fps=a.fps,
        ramp_in=a.ramp_in, ramp_out=a.ramp_out, grade=not a.no_grade, out=a.out)]
    with ThreadPoolExecutor(a.jobs) as ex:
        for o in ex.map(cut, specs): print("✓", o)


if __name__ == "__main__":
    main()
