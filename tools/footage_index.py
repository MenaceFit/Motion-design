#!/usr/bin/env python3
"""Indexe une bibliothèque de footage (trailers, captures de gameplay, screenshots) pour le montage.

Pour chaque vidéo : proxy 640 px → détection de plans → par plan : durée, mouvement, luminosité,
**trajectoire de cadrage 9:16** (visages Haar + saillance spectrale), 3 vignettes.
Pour chaque image fixe : point d'intérêt + tags déduits du dossier (« People/Jason Duval »).
Puis des **planches contact numérotées** (cadre 9:16 dessiné) que Claude lit pour écrire tags.json.

Fichiers (dans footage/index/) :
  index.json   entrées machine {id, kind: shot|still, src, start, end, dur, motion, luma, focus:[x0,x1], ...}
  tags         references/gta-footage-tags.json (versionné), écrits par Claude après lecture des planches :
               {"T1-012": {"tags": ["voiture","plage","nuit"], "desc": "...", "q": 0-3, "avoid": false}}
  sheets/      planches contact (1 par source, 24 plans par page)

Sous-commandes :
  build  [--src footage/raw] [--threshold 27]         indexe les nouveaux fichiers (incrémental)
  sheets [--src-filter Trailer_1]                       régénère les planches
  search --tags voiture nuit [--any] [--min-dur 1] [--kind shot] [--limit 20] [--exclude ID…]
  stats                                                 couverture des tags

Usage : python3 tools/footage_index.py build && python3 tools/footage_index.py sheets
"""
import argparse, hashlib, json, os, re, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parent.parent
FOOT = ROOT / "footage"
IDX = FOOT / "index"
PROXY = FOOT / "proxy"
TAGS = ROOT / "references" / "gta-footage-tags.json"  # versionné (IDs de plans déterministes)
VID = {".mp4", ".mov", ".mkv", ".webm", ".m4v"}
IMG = {".jpg", ".jpeg", ".png", ".webp"}
YUNET = FOOT / "models" / "face_detection_yunet_2023mar.onnx"
YUNET_URL = "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx"
_FACE = {}


def face_detector(w, h):
    """Détecteur de visages YuNet (OpenCV DNN, modèle MIT ~230 Ko). None si le modèle est indisponible."""
    if not YUNET.exists():
        YUNET.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["curl", "-sSL", "-m", "60", "-o", str(YUNET), YUNET_URL])
        if not YUNET.exists() or YUNET.stat().st_size < 100_000:
            YUNET.unlink(missing_ok=True); return None
    d = _FACE.get("d")
    if d is None:
        d = _FACE["d"] = cv2.FaceDetectorYN.create(str(YUNET), "", (w, h), 0.75)
    d.setInputSize((w, h))
    return d
TARGET_AR = 9 / 16


# ---------- cadrage ----------
def spectral_saliency(gray):
    """Saillance « spectral residual » (Hou & Zhang 2007) sur une image 128 px."""
    g = cv2.resize(gray, (128, int(128 * gray.shape[0] / gray.shape[1]))).astype(np.float32)
    f = np.fft.fft2(g)
    la = np.log(np.abs(f) + 1e-6)
    sr = la - cv2.blur(la, (3, 3))
    s = np.abs(np.fft.ifft2(np.exp(sr + 1j * np.angle(f)))) ** 2
    s = cv2.GaussianBlur(s, (0, 0), 3)
    return s / (s.max() + 1e-9)


def focus_x(bgr):
    """Abscisse normalisée (0–1) du centre d'intérêt : visages en priorité, sinon saillance."""
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    det = face_detector(w, h)
    faces = []
    if det is not None:
        _, r = det.detect(bgr)
        faces = [] if r is None else [f[:4] for f in r if f[2] >= w / 40]
    if len(faces):
        a = np.array([fw * fh for (_, _, fw, fh) in faces], float)
        cx = np.array([x + fw / 2 for (x, _, fw, _) in faces])
        return float((cx * a).sum() / a.sum() / w), True
    s = spectral_saliency(gray)
    col = (s ** 2).sum(0)
    xs = np.linspace(0, 1, len(col))
    c = float((col * xs).sum() / (col.sum() + 1e-9))
    return 0.5 + (c - 0.5) * 0.8, False  # ramène un peu vers le centre (la saillance est bruitée)


def clamp_focus(x, ar_src):
    """Le centre de la fenêtre 9:16 doit rester dans l'image."""
    half = (TARGET_AR / ar_src) / 2 if ar_src > TARGET_AR else 0.5
    return float(min(1 - half, max(half, x)))


# ---------- vidéos ----------
def make_proxy(src):
    PROXY.mkdir(parents=True, exist_ok=True)
    out = PROXY / (src.stem + ".mp4")
    if not out.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-an", "-vf", "scale=640:-2,fps=30",
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", str(out)], check=True)
    return out


def detect_shots(proxy, threshold):
    from scenedetect import detect, ContentDetector
    sc = detect(str(proxy), ContentDetector(threshold=threshold, min_scene_len=5))
    if not sc:
        cap = cv2.VideoCapture(str(proxy)); n = cap.get(cv2.CAP_PROP_FRAME_COUNT); fps = cap.get(cv2.CAP_PROP_FPS)
        return [(0.0, n / fps)]
    return [(s.get_seconds(), e.get_seconds()) for s, e in sc]


def short_id(src):
    """Identifiant court et stable : T1 (Trailer_1), T2, LT (Launch), ON (Out Now), sinon initiales + hash."""
    n = src.stem.lower()
    for k, v in [("trailer_1", "T1"), ("trailer_2", "T2"), ("launch_trailer", "LT"), ("out_now", "ON"),
                 ("extended_look", "EL")]:
        if k in n:
            return v
    letters = "".join(p[0] for p in re.split(r"[_\-\s]+", src.stem) if p and p[0].isalpha())[:3].upper()
    return (letters or "V") + hashlib.sha1(src.name.encode()).hexdigest()[:3].upper()


def index_video(args):
    src, threshold = args
    src = Path(src)
    proxy = make_proxy(src)
    meta = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                      "stream=width,height", "-of", "json", str(src)], capture_output=True, text=True).stdout)["streams"][0]
    W, H = meta["width"], meta["height"]
    shots = detect_shots(proxy, threshold)
    cap = cv2.VideoCapture(str(proxy)); fps = cap.get(cv2.CAP_PROP_FPS)
    sid = short_id(src)
    tdir = IDX / "thumbs"; tdir.mkdir(parents=True, exist_ok=True)
    out = []
    bounds = [(int(round(s * fps)), int(round(e * fps))) for s, e in shots]
    fi = 0
    for i, (a, b) in enumerate(bounds):
        seg = []
        while fi < b:  # lecture en flux : un seul plan en mémoire
            ok, f = cap.read()
            if not ok: break
            if fi >= a: seg.append(f)
            fi += 1
        if len(seg) < 3: continue
        b = a + len(seg)
        g = [cv2.cvtColor(cv2.resize(f, (160, 90)), cv2.COLOR_BGR2GRAY).astype(np.float32) for f in seg[::2]]
        motion = float(np.mean([np.abs(g[k + 1] - g[k]).mean() for k in range(len(g) - 1)])) if len(g) > 1 else 0.0
        luma = float(np.mean([x.mean() for x in g]))
        hsv = cv2.cvtColor(seg[len(seg) // 2], cv2.COLOR_BGR2HSV)
        sat = float(hsv[..., 1].mean())
        samples = np.linspace(0, len(seg) - 1, min(7, len(seg))).astype(int)
        fx = [focus_x(seg[k]) for k in samples]
        xs = np.array([x for x, _ in fx]); faces = sum(1 for _, f in fx if f)
        n3 = max(1, len(xs) // 3)
        ar = W / H
        x0, x1 = clamp_focus(float(np.median(xs[:n3 + 1])), ar), clamp_focus(float(np.median(xs[-n3 - 1:])), ar)
        if abs(x1 - x0) < 0.03: x0 = x1 = (x0 + x1) / 2  # évite les micro-pans parasites
        id_ = f"{sid}-{i:03d}"
        for k, q in zip(("a", "m", "b"), (0.2, 0.5, 0.8)):
            cv2.imwrite(str(tdir / f"{id_}_{k}.jpg"), cv2.resize(seg[int(q * (len(seg) - 1))], (320, int(320 * seg[0].shape[0] / seg[0].shape[1]))),
                        [cv2.IMWRITE_JPEG_QUALITY, 82])
        out.append({"id": id_, "kind": "shot", "src": str(src.relative_to(ROOT)), "proxy": str(proxy.relative_to(ROOT)),
                    "w": W, "h": H, "start": round(a / fps, 3), "end": round(b / fps, 3), "dur": round((b - a) / fps, 3),
                    "motion": round(motion, 2), "luma": round(luma, 1), "sat": round(sat, 1),
                    "focus": [round(x0, 3), round(x1, 3)], "faces": faces,
                    "dark": luma < 28, "static": motion < 0.6})
    return str(src), out


def index_still(path):
    img = cv2.imread(str(path))
    if img is None: return None
    h, w = img.shape[:2]
    small = cv2.resize(img, (960, int(960 * h / w)))
    x, face = focus_x(small)
    parts = path.relative_to(FOOT / "raw").parts
    tags = [p.lower() for p in parts[1:-1] if not p.lower().startswith("gtavi_")]
    id_ = "S-" + re.sub(r"[^A-Za-z0-9]+", "", path.stem)[-18:]
    tdir = IDX / "thumbs"; tdir.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(tdir / f"{id_}_m.jpg"), cv2.resize(img, (320, int(320 * h / w))), [cv2.IMWRITE_JPEG_QUALITY, 82])
    return {"id": id_, "kind": "still", "src": str(path.relative_to(ROOT)), "w": w, "h": h, "dur": None,
            "focus": [clamp_focus(x, w / h)] * 2, "faces": int(face), "auto_tags": tags,
            "luma": round(float(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).mean()), 1)}


def load(name, default):
    p = TAGS if name == "tags.json" else IDX / name
    return json.loads(p.read_text()) if p.exists() else default


def build(src_dir, threshold):
    IDX.mkdir(parents=True, exist_ok=True)
    index = load("index.json", {"sources": {}, "items": []})
    done = set(index["sources"])
    files = sorted(p for p in Path(src_dir).rglob("*") if p.is_file())
    vids = [p for p in files if p.suffix.lower() in VID and str(p) not in done]
    imgs = [p for p in files if p.suffix.lower() in IMG and str(p) not in done]
    print(f"{len(vids)} vidéos, {len(imgs)} images à indexer")
    with ProcessPoolExecutor(max_workers=max(1, min(4, os.cpu_count() or 2))) as ex:
        for src, items in ex.map(index_video, [(str(v), threshold) for v in vids]):
            index["items"] += items; index["sources"][src] = len(items)
            print(f"  {Path(src).name}: {len(items)} plans")
            (IDX / "index.json").write_text(json.dumps(index, indent=0))
        for p, it in zip(imgs, ex.map(index_still, imgs)):
            index["sources"][str(p)] = 1
            if it: index["items"].append(it)
    (IDX / "index.json").write_text(json.dumps(index, indent=0))
    print(f"index : {len(index['items'])} entrées → {(IDX / 'index.json').relative_to(ROOT)}")


# ---------- planches ----------
def sheets(filt=None, per=24, cols=6):
    index = load("index.json", {"items": []})
    tags = load("tags.json", {})
    out = IDX / "sheets"; out.mkdir(parents=True, exist_ok=True)
    groups = {}
    for it in index["items"]:
        key = Path(it["src"]).parent.name if it["kind"] == "still" else Path(it["src"]).stem
        if filt and filt.lower() not in it["src"].lower(): continue
        groups.setdefault(key, []).append(it)
    made = []
    for key, items in groups.items():
        for pg in range(0, len(items), per):
            chunk = items[pg:pg + per]
            tiles = []
            for it in chunk:
                im = cv2.imread(str(IDX / "thumbs" / f"{it['id']}_m.jpg"))
                if im is None: continue
                if it["kind"] == "shot" and it["dur"] > 3.5 and it["w"] >= it["h"]:
                    # plan long : début | milieu | fin (les fondus enchaînés échappent à la détection de coupes)
                    parts = [cv2.imread(str(IDX / "thumbs" / f"{it['id']}_{k}.jpg")) for k in "amb"]
                    if all(x is not None for x in parts):
                        im = np.hstack([cv2.resize(x, (107, 180))[:, :] for x in parts])[:, :320]
                        im = cv2.resize(im, (320, 180))
                im = cv2.resize(im, (320, 180)) if it["w"] >= it["h"] else cv2.copyMakeBorder(
                    cv2.resize(im, (int(180 * im.shape[1] / im.shape[0]), 180)), 0, 0, 0, 0, cv2.BORDER_CONSTANT)
                if im.shape[1] != 320:
                    pad = (320 - im.shape[1]) // 2
                    im = cv2.copyMakeBorder(im, 0, 0, pad, 320 - im.shape[1] - pad, cv2.BORDER_CONSTANT, value=(20, 20, 20))
                if it["w"] > it["h"]:  # fenêtre 9:16 (début → fin)
                    cw = 180 * TARGET_AR
                    for fx, col in zip(it["focus"], ((0, 220, 255), (255, 120, 0))):
                        x = int(fx * 320 - cw / 2)
                        cv2.rectangle(im, (x, 0), (int(x + cw), 179), col, 1)
                lab = f"{it['id']} {it['dur']:.1f}s" if it["dur"] else it["id"]
                if it["id"] in tags: lab += " *"
                cv2.rectangle(im, (0, 0), (320, 20), (0, 0, 0), -1)
                cv2.putText(im, lab, (4, 15), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255, 255, 255), 1, cv2.LINE_AA)
                tiles.append(im)
            while len(tiles) % cols: tiles.append(np.full((180, 320, 3), 12, np.uint8))
            rows = [np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)]
            p = out / f"{key}_{pg // per:02d}.jpg"
            cv2.imwrite(str(p), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
            made.append(p)
    for p in made: print(p.relative_to(ROOT))


# ---------- recherche ----------
def search(want, any_, min_dur, kind, limit, exclude):
    index = load("index.json", {"items": []}); tags = load("tags.json", {})
    want = [w.lower() for w in want]; res = []
    for it in index["items"]:
        if kind and it["kind"] != kind: continue
        if it["id"] in exclude: continue
        t = tags.get(it["id"], {})
        if t.get("avoid"): continue
        if it["dur"] and it["dur"] < min_dur: continue
        have = set(x.lower() for x in t.get("tags", []) + it.get("auto_tags", []))
        hit = [w for w in want if any(w in h for h in have) or w in t.get("desc", "").lower()]
        if not want or (hit if any_ else len(hit) == len(want)):
            score = len(hit) * 10 + t.get("q", 1) * 3 + min(it.get("motion", 2), 6) * 0.5 + (it["dur"] or 3) * 0.2
            res.append((score, it, t))
    res.sort(key=lambda r: -r[0])
    for s, it, t in res[:limit]:
        print(f"{it['id']:<22} {it['kind']:<5} {it['dur'] or 0:5.1f}s q{t.get('q', '?')} {','.join(t.get('tags', it.get('auto_tags', [])))[:60]:<60} {t.get('desc', '')[:50]}")


def stats():
    index = load("index.json", {"items": []}); tags = load("tags.json", {})
    n = len(index["items"]); tagged = sum(1 for it in index["items"] if it["id"] in tags)
    cnt = {}
    for t in tags.values():
        for x in t.get("tags", []): cnt[x] = cnt.get(x, 0) + 1
    print(f"{n} entrées, {tagged} taguées ({tagged * 100 // max(1, n)} %)")
    print(" ".join(f"{k}:{v}" for k, v in sorted(cnt.items(), key=lambda kv: -kv[1])[:60]))


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    b = sp.add_parser("build"); b.add_argument("--src", default=str(FOOT / "raw")); b.add_argument("--threshold", type=float, default=27)
    s = sp.add_parser("sheets"); s.add_argument("--src-filter")
    q = sp.add_parser("search"); q.add_argument("--tags", nargs="*", default=[]); q.add_argument("--any", action="store_true")
    q.add_argument("--min-dur", type=float, default=0.0); q.add_argument("--kind"); q.add_argument("--limit", type=int, default=20)
    q.add_argument("--exclude", nargs="*", default=[])
    sp.add_parser("stats")
    a = ap.parse_args()
    if a.cmd == "build": build(a.src, a.threshold)
    elif a.cmd == "sheets": sheets(a.src_filter)
    elif a.cmd == "search": search(a.tags, a.any, a.min_dur, a.kind, a.limit, set(a.exclude))
    else: stats()


if __name__ == "__main__":
    main()
