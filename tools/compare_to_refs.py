#!/usr/bin/env python3
"""Benchmark d'une vidéo produite contre le profil des vidéos de référence.

Les mêmes mesures sont faites sur nos rendus et sur les références, dans les mêmes conditions
(vidéo ramenée à 30 fps / 576 px de large, carte de fin TikTok exclue des références) :
  motion_mean     mouvement moyen image à image (énergie visuelle)
  static_ratio    part des images quasi immobiles (< 0,5)
  max_static_s    plus longue période sans mouvement notable (s) — tue la rétention si trop longue
  events_per_s    « événements visuels » par seconde (pics de mouvement : coupes, pops, impacts)
  cuts_per_min    changements de plan détectés
  luma_mean       luminosité moyenne (les refs sont sombres)

Usage :
  python3 tools/compare_to_refs.py --build-profile <dossier_analyses_refs>   # (une fois)
  python3 tools/compare_to_refs.py ma_video.mp4 [--style neon-explainer]
"""
import argparse, csv, json, os, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILE = os.path.join(ROOT, "references", "refs_profile.json")
CONTENT_END = {"ref01": 45.0, "ref02": 29.5, "ref03": 62.3, "ref04": 36.5, "ref05": 25.3}
STYLE_OF = {"ref01": "neon-explainer", "ref02": "golden-neuro", "ref03": "night-chat-story", "ref04": "minimal-line", "ref05": "minimal-line"}


def metrics(motion_rows, cuts, end=None, fps=30.0):
    rows = [r for r in motion_rows if end is None or r[1] <= end]
    mv = np.array([r[2] for r in rows]); lu = np.array([r[3] for r in rows])
    dur = len(rows) / fps
    static = mv < 0.5
    run = best = 0
    for s in static:
        run = run + 1 if s else 0; best = max(best, run)
    # pics : maximum local > 2,5× la médiane glissante et > 1.5
    med = np.median(mv) + 1e-6
    peaks = [i for i in range(1, len(mv) - 1) if mv[i] > max(1.5, 2.5 * med) and mv[i] >= mv[i - 1] and mv[i] >= mv[i + 1]]
    # fusionner les pics à moins de 4 frames
    ev = []
    for p in peaks:
        if not ev or p - ev[-1] > 4: ev.append(p)
    ncut = len([c for c in cuts if end is None or c["start"] <= end])
    return {"duration_s": round(dur, 2), "motion_mean": round(float(mv.mean()), 2), "static_ratio": round(float(static.mean()), 3),
            "max_static_s": round(best / fps, 2), "events_per_s": round(len(ev) / dur, 2),
            "cuts_per_min": round(ncut / dur * 60, 1), "luma_mean": round(float(lu.mean()), 1)}


def read_motion(path):
    with open(path) as f:
        r = csv.reader(f); next(r)
        return [(int(a), float(b), float(c), float(d)) for a, b, c, d in r]


def build_profile(an_dir):
    prof = {}
    for ref, end in CONTENT_END.items():
        d = os.path.join(an_dir, ref)
        m = metrics(read_motion(os.path.join(d, "motion.csv")), json.load(open(os.path.join(d, "scenes.json"))), end)
        m["style"] = STYLE_OF[ref]; prof[ref] = m
    keys = [k for k in prof["ref01"] if k not in ("style", "duration_s")]
    prof["_range"] = {k: [min(prof[r][k] for r in CONTENT_END), max(prof[r][k] for r in CONTENT_END)] for k in keys}
    json.dump(prof, open(PROFILE, "w"), indent=1)
    print(json.dumps(prof, indent=1))


def analyse(video):
    tmp = tempfile.mkdtemp()
    norm = os.path.join(tmp, "n.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", "fps=30,scale=576:-2", "-an", norm], check=True)
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "analyze_reference.py"), norm, tmp, "--step", "1.0"],
                   check=True, capture_output=True)
    return metrics(read_motion(os.path.join(tmp, "motion.csv")), json.load(open(os.path.join(tmp, "scenes.json"))))


ADVICE = {
    ("motion_mean", "low"): "Trop calme : ajouter du mouvement continu (caméra, objets de scène, particules).",
    ("motion_mean", "high"): "Trop agité : risque de fatigue ; garder une seule action principale à la fois.",
    ("static_ratio", "high"): "Trop d'images immobiles : animer les temps morts (respiration, boucles, parallaxe).",
    ("max_static_s", "high"): "Une période figée trop longue : insérer un événement (pop, impact, changement de scène).",
    ("events_per_s", "low"): "Pas assez d'événements visuels : ponctuer chaque idée (pop d'objet, impact, coupe).",
    ("events_per_s", "high"): "Trop d'événements : regrouper, laisser respirer les punchlines.",
    ("cuts_per_min", "low"): "Pas assez de changements de plan : une nouvelle scène/métaphore par phrase.",
    ("luma_mean", "high"): "Image plus claire que les références (sombres) : assombrir le fond pour le contraste du texte.",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video", nargs="?"); ap.add_argument("--build-profile"); ap.add_argument("--style")
    a = ap.parse_args()
    if a.build_profile: return build_profile(a.build_profile)
    prof = json.load(open(PROFILE))
    m = analyse(a.video)
    rng = prof["_range"]
    if a.style:
        refs = [r for r in CONTENT_END if prof[r]["style"] == a.style]
        rng = {k: [min(prof[r][k] for r in refs), max(prof[r][k] for r in refs)] for k in rng}
    print(f"== Benchmark {os.path.basename(a.video)} vs références{' (' + a.style + ')' if a.style else ''}")
    ok = 0
    for k, (lo, hi) in rng.items():
        v = m[k]; tol = 0.15 * (hi - lo + 1e-6)
        st = "OK" if lo - tol <= v <= hi + tol else ("BAS" if v < lo else "HAUT")
        ok += st == "OK"
        print(f"  {k:<14} {v:>8}   refs [{lo} – {hi}]   {st}")
        adv = ADVICE.get((k, "low" if st == "BAS" else "high")) if st != "OK" else None
        if adv: print(f"      → {adv}")
    print(f"  SCORE : {ok}/{len(rng)} métriques dans la plage des références")
    return m


if __name__ == "__main__":
    main()
