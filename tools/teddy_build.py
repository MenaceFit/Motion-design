#!/usr/bin/env python3
"""Construit l'audio et les données d'un épisode de la série Teddy J-30.

Entrée : JSON d'épisode (lignes de voix off avec pauses, remplacements d'affichage, couleurs des
mots-clés, SFX calés sur des repères de ligne). Sortie (dans --out) :
  voice.wav, music.wav, master.wav (voix + musique duckée + SFX), episode.json (repères de lignes,
  sous-titres groupés par 1–2 mots, durée) — consommé par la composition Remotion « TeddyEp01 ».

Usage : python3 tools/teddy_build.py projects/teddy-j30/ep01/part1.json --out <dossier>
"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "remotion-kinetic"
PY = sys.executable
COL = {"gold": "#FFC23D", "pink": "#FF4F8B", "cyan": "#3FE0FF", "red": "#FF3B4E", "violet": "#7B4DFF", "orange": "#FF8A1F"}
SYNTH = {"whoosh_in", "whoosh_out", "swish", "sub_hit", "riser", "pop", "click", "tick", "glitch", "shimmer", "typewriter", "blip_up", "blip_down"}


def run(cmd, **kw):
    subprocess.run([str(c) for c in cmd], check=True, **kw)


STOP = {"DANS", "SON", "SA", "SES", "SE", "ET", "ELLE", "IL", "L'A", "À", "AU", "AUX", "LA", "LE", "LES", "L'", "UN", "UNE", "DES",
        "DE", "DU", "D'", "EN", "EST", "PAS", "PAR", "POUR", "SUR", "QUI", "QUE", "MAIS", "OU", "NE", "N'A", "VOICI", "DEPUIS", "SONT",
        "TOUT", "TRÈS", "PLUS", "SI", "ON", "TU", "JE", "MA", "MON", "TES", "TON", "TA", "CE", "CET", "CETTE", "LUI", "Y", "A",
        "MÊME", "AVANT", "APRÈS", "QUAND", "AVEC", "MOI", "J'AI", "CELUI", "ALORS", "LÀ", "OÙ", "SES", "NOS", "VOS", "VOTRE"}
PUNCT = ".,!?…:;"


def _norm(w):
    return re.sub(r"[^\wÀ-ÿœæ'’-]", "", w).upper()


def group_captions(words, lines):
    """Sous-titres du genre : 1–2 mots (3 si très courts), ≤ 13 caractères.
    Règles : les mots-outils (STOP) s'accrochent au mot suivant ; un mot de contenu ou un mot-clé
    ferme le groupe ; un mot-clé (ou une expression clé « VRAIE VIE ») est coloré en entier et
    termine toujours son groupe ; jamais à cheval sur deux lignes ; remplacements d'affichage."""
    flat = []
    for w in words:
        parts = w["text"].split()
        d = (w["end"] - w["start"]) / len(parts)
        for i, p in enumerate(parts):
            flat.append({"text": p, "start": w["start"] + i * d, "line": w.get("line", 0)})
    # ponctuation de fin de mot (depuis le texte source de chaque ligne) → frontière de groupe
    by_line = {}
    for li, ln in enumerate(lines):
        flags = []
        for tok in ln["text"].split():
            if _norm(tok): flags.append(tok[-1] in PUNCT)
            elif flags and any(ch in PUNCT for ch in tok): flags[-1] = True   # « marié ? » : ponctuation isolée
        by_line[li] = flags
    idx = {}
    for fw in flat:
        k = idx.get(fw["line"], 0); flags = by_line.get(fw["line"], [])
        fw["punct"] = flags[k] if k < len(flags) else False
        idx[fw["line"]] = k + 1
    # 1) jetons : expressions (remplacements, mots-clés multi-mots) fusionnées
    toks, i = [], 0
    while i < len(flat):
        ln = lines[flat[i]["line"]]
        phrases = [(src, dst) for src, dst in ln.get("replace", {}).items()] + [(k, k) for k in ln.get("colors", {}) if " " in k]
        hit = None
        for src, dst in sorted(phrases, key=lambda x: -len(x[0].split())):
            n = len(src.split())
            if " ".join(x["text"] for x in flat[i:i + n]) == src:
                hit = (dst, n); break
        if hit:
            toks.append({"text": hit[0], "start": flat[i]["start"], "line": flat[i]["line"], "punct": flat[i + hit[1] - 1]["punct"]}); i += hit[1]
        else:
            toks.append(dict(flat[i])); i += 1
    for tk in toks:
        cols = lines[tk["line"]].get("colors", {})
        tk["key"] = cols.get(tk["text"])
        tk["stop"] = tk["text"] in STOP and not tk["key"]
    # 2) groupes
    out, g = [], []
    def close():
        if g:
            key = g[-1]["key"]
            out.append({"text": " ".join(x["text"] for x in g), "start": g[0]["start"], "line": g[0]["line"], "punct": bool(g[-1].get("punct")),
                        **({"color": COL[key], "colorWords": len(g[-1]["text"].split())} if key else {})})
            g.clear()
    for tk in toks:
        if g:
            txt = " ".join(x["text"] for x in g + [tk])
            nwords = len(txt.split())
            same = tk["line"] == g[0]["line"] and not g[-1].get("punct")
            open_ = all(x["stop"] for x in g)                       # le groupe n'a encore que des mots-outils
            key_after_one = len(g) == 1 and not g[0]["stop"] and tk["key"] and not g[0]["key"] and nwords <= 2
            fits = len(txt) <= 14 and (nwords <= 2 or len(txt) <= 11 or (tk["key"] and len(g) == 1))
            if not (same and fits and (open_ or key_after_one)):
                close()
        g.append(tk)
        if not tk["stop"] and not (len(g) == 1 and tk["key"] is None and False):
            # un mot de contenu ferme le groupe, sauf s'il est seul et qu'un mot-clé peut suivre (« RANG DIAMANT »)
            pass
        if tk["key"] or tk.get("punct"):
            close()
        elif not tk["stop"] and len(g) > 1:
            close()
    close()
    # un mot-outil resté seul rejoint le groupe précédent (même phrase, non coloré, ≤ 14 car.)
    merged = []
    for c2 in out:
        lone = len(c2["text"].split()) == 1 and c2["text"] in STOP and "color" not in c2
        if lone and merged and merged[-1]["line"] == c2["line"] and "color" not in merged[-1] \
                and not merged[-1].get("punct") and len(merged[-1]["text"]) + 1 + len(c2["text"]) <= 14:
            merged[-1]["text"] += " " + c2["text"]
        else:
            merged.append(c2)
    out = merged
    for k, c in enumerate(out):
        c["end"] = round(out[k + 1]["start"] if k + 1 < len(out) else c["start"] + 0.9, 3)
        c["start"] = round(c["start"], 3)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode"); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    ep = json.load(open(a.episode, encoding="utf-8"))
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    lines = ep["lines"]
    json.dump([{k: l[k] for k in ("text", "pause", "speed", "pitch") if k in l} for l in lines], open(out / "script.json", "w", encoding="utf-8"), ensure_ascii=False)
    v = ep.get("voice", {})
    run([PY, ROOT / "tools/tts_voice.py", out / "script.json", out, "--engine", v.get("engine", "pico"), "--speed", v.get("speed", 1.05), "--pitch", v.get("pitch", 0)])
    words = json.load(open(out / "words.json", encoding="utf-8"))
    starts, ends = {}, {}
    for w in words:
        lid = lines[w["line"]]["id"]
        starts.setdefault(lid, w["start"]); ends[lid] = w["end"]
    caps = group_captions(words, lines)
    import soundfile as sf
    vdur = sf.info(str(out / "voice.wav")).duration
    duration = round(max(vdur, caps[-1]["end"]) + 0.6, 2)
    ids = [l["id"] for l in lines]
    for k, lid in enumerate(ids[:-1]):  # fin de PAROLE (sans la pause de mise en scène)
        if lid in starts and ids[k + 1] in starts:
            ends[lid] = starts[ids[k + 1]] - lines[k].get("pause", 0.2)
    cues = {"start": 0.0, **starts, **{f"{k}end": v for k, v in ends.items()}}
    m = ep.get("music", {})
    drop = cues.get(ep.get("drop_cue", "L1end"), 2.0) + 0.15
    run([PY, ROOT / "tools/music_gen.py", out / "music.wav", "--mood", m.get("mood", "hype"), "--bpm", m.get("bpm", 125), "--duration", duration + 0.5, "--drop", round(drop, 3), "--seed", m.get("seed", 1)])
    # SFX
    lib = TPL / "public" / "sfxlib"
    if not (lib / "catalog.json").exists():
        run(["node", "scripts/build_sfx_library.mjs"], cwd=TPL)
    synth_dir = out / "sfx"
    run([PY, ROOT / "tools/sfx_synth.py", synth_dir, "--variants", 2, "--seed", m.get("seed", 1)])
    plan = []
    for s in ep.get("sfx", []):
        f = synth_dir / f"{s['id']}_01.wav" if s["id"] in SYNTH else lib / f"{s['id']}.wav"
        if f.exists():
            plan.append({"src": str(f), "at": round(cues[s["cue"]] + s.get("at", 0), 3), "volume": s.get("vol", 0.5)})
        else:
            print("SFX introuvable :", s["id"])
    for k, c in enumerate(caps):  # pop discret à chaque sous-titre (grammaire du genre, ~1 son / 0,4 s)
        plan.append({"src": str(lib / f"zzfx/pop.wav"), "at": max(0, c["start"] - 1 / 60), "volume": 0.12 + 0.05 * (k % 2)})
    json.dump(plan, open(out / "sfx.json", "w"), indent=1)
    run([PY, ROOT / "tools/mix_audio.py", out / "master.wav", "--voice", out / "voice.wav", "--music", out / "music.wav", "--sfx", out / "sfx.json",
         "--duration", duration, "--music-db", -17, "--duck-db", 7])
    pub = TPL / "public" / "projects" / ep["slug"]; pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(out / "master.wav", pub / "master.wav")
    data = {"slug": ep["slug"], "duration": duration, "cues": {k: round(v, 3) for k, v in cues.items()}, "caps": caps,
            "audio": f"projects/{ep['slug']}/master.wav"}
    json.dump(data, open(out / "episode.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps({"duration": duration, "cues": data["cues"], "ncaps": len(caps)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
