#!/usr/bin/env python3
"""Sourcing de médias GTA VI **réels** avec traçabilité (provenance.json).

Règle : on n'utilise que des images/vidéos qui existent — téléchargements officiels Rockstar ou
captures fournies par l'utilisateur. Rien n'est généré ni inventé. Chaque fichier a une entrée de
provenance (URL ou origine, date, sha256, note de droits).

Hôtes nécessaires (réglage réseau de l'environnement) :
  www.rockstargames.com                   pages officielles + clips personnages + captures
  media-rockstargames-com.akamaized.net   téléchargements officiels (trailers mp4, packs zip)

Sous-commandes :
  catalog  [--out footage/catalog.json]       inventorie les médias officiels (pages /VI/…)
  fetch    trailers|screenshots|clips|all     télécharge dans footage/raw/gta6/ (+ dézippe)
           [--max-gb 4] [--include NOM]        (« An Extended Look » = 14 Go : exclu par défaut)
  ingest   fichier(s) --origin "texte"        ajoute des captures de l'utilisateur (gameplay perso)
  show                                        résume footage/provenance.json

Usage : python3 tools/gta_source.py fetch all
"""
import argparse, datetime as dt, hashlib, json, re, shutil, subprocess, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOOT = ROOT / "footage"
RAW = FOOT / "raw" / "gta6"
PROV = FOOT / "provenance.json"
SITE = "https://www.rockstargames.com"
PAGES = ["/VI", "/VI/media", "/VI/media/videos", "/VI/media/screenshots", "/VI/media/artwork-wallpapers",
         "/VI/only-in-leonida", "/VI/launch-gallery"]
RIGHTS = ("Matériel officiel Take-Two/Rockstar. Politique fan (support.rockstargames.com, maj 2025-01-10) : "
          "usage non commercial toléré, retrait possible à tout moment ; pas de leaks ; pas de triche en ligne. "
          "Audio des trailers = musique sous licence → toujours coupé.")


def curl(url, out=None, timeout=60):
    cmd = ["curl", "-sSL", "--retry", "4", "--retry-delay", "3", "-m", str(timeout), url]
    if out:
        cmd[1:1] = ["-C", "-", "-o", str(out)]
        cmd[cmd.index("-m") + 1] = "7200"
    r = subprocess.run(cmd, capture_output=not out, text=not out)
    if r.returncode not in (0, 33):  # 33 = reprise impossible (fichier déjà complet)
        raise RuntimeError(f"curl {r.returncode} sur {url} (hôte autorisé dans l'environnement ?)")
    return r.stdout if not out else out


def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def load_prov():
    return json.loads(PROV.read_text()) if PROV.exists() else {}


def save_prov(d):
    PROV.parent.mkdir(parents=True, exist_ok=True)
    PROV.write_text(json.dumps(d, indent=1, ensure_ascii=False))


def record(prov, path, origin, url=None, kind="official"):
    rel = str(Path(path).resolve().relative_to(ROOT))
    prov[rel] = {"origin": origin, "url": url, "kind": kind, "sha256": sha256(path),
                 "fetched": dt.datetime.now().isoformat(timespec="seconds"), "rights": RIGHTS if kind == "official" else origin}


def catalog():
    found = {"videos": set(), "zips": set(), "clips": set(), "images": set()}
    for p in PAGES:
        try:
            html = curl(SITE + p)
        except RuntimeError as e:
            print("!", e, file=sys.stderr); continue
        for u in re.findall(r"https://media-rockstargames-com\.akamaized\.net/VI/downloads/[^\"'\\ ]+\.(?:mp4|zip)", html):
            found["videos" if u.endswith(".mp4") else "zips"].add(u)
        for u in re.findall(r"/VI/_next/static/media/[A-Za-z0-9_~.\-]+\.(?:mp4|jpg|png)", html):
            found["clips" if u.endswith(".mp4") else "images"].add(SITE + u)
    return {k: sorted(v) for k, v in found.items()}


def size_of(url):
    out = subprocess.run(["curl", "-sIL", "-m", "30", url], capture_output=True, text=True).stdout
    m = re.findall(r"(?i)content-length:\s*(\d+)", out)
    return int(m[-1]) if m else 0


def fetch(what, max_gb, include):
    cat = catalog()
    (FOOT / "catalog.json").write_text(json.dumps(cat, indent=1))
    prov = load_prov()
    RAW.mkdir(parents=True, exist_ok=True)
    todo = []
    if what in ("trailers", "all"):
        todo += [u for u in cat["videos"]]
    if what in ("screenshots", "all"):
        todo += [u for u in cat["zips"] if "/screenshots/" in u]
    if what in ("clips", "all"):
        # boucles du site : chaque vidéo existe en AV1/HEVC × 1280/1920 → garder HEVC 1920 seulement
        todo += [u for u in cat["clips"] if "_av1" not in u and "/1280_" not in u]
    for u in todo:
        base = u.rsplit("/", 1)[-1]
        stem, ext = base.split(".")[0], base.rsplit(".", 1)[-1]
        # fichiers /_next/ : le nom porte un hash de build → nom stable + empreinte courte de l'URL (unicité)
        name = f"{stem}_{hashlib.sha1(u.encode()).hexdigest()[:6]}.{ext}" if "/_next/" in u else base
        dest = RAW / name
        if dest.exists() and str(dest.relative_to(ROOT)) in prov:
            print("déjà là :", name); continue
        sz = size_of(u)
        if sz > max_gb * 1e9 and not any(i.lower() in u.lower() for i in include):
            print(f"ignoré ({sz / 1e9:.1f} Go > --max-gb {max_gb}) : {name}"); continue
        print(f"↓ {name} ({sz / 1e6:.0f} Mo)")
        curl(u, dest)
        record(prov, dest, "Rockstar Games — téléchargement officiel", u)
        if dest.suffix == ".zip":
            out = RAW / dest.stem
            with zipfile.ZipFile(dest) as z:
                z.extractall(out)
            for f in out.rglob("*.jpg"):
                record(prov, f, f"Rockstar Games — extrait de {dest.name}", u)
        save_prov(prov)
    save_prov(prov)
    print(f"provenance : {PROV.relative_to(ROOT)} ({len(prov)} fichiers)")


def ingest(files, origin):
    prov = load_prov()
    dst = FOOT / "raw" / "user"
    dst.mkdir(parents=True, exist_ok=True)
    for f in files:
        f = Path(f)
        d = dst / f.name
        if not d.exists():
            shutil.copy2(f, d)
        record(prov, d, origin, kind="user")
        print("+", d.relative_to(ROOT))
    save_prov(prov)


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    c = sp.add_parser("catalog"); c.add_argument("--out", default=str(FOOT / "catalog.json"))
    f = sp.add_parser("fetch"); f.add_argument("what", choices=["trailers", "screenshots", "clips", "all"])
    f.add_argument("--max-gb", type=float, default=4); f.add_argument("--include", nargs="*", default=[])
    i = sp.add_parser("ingest"); i.add_argument("files", nargs="+"); i.add_argument("--origin", required=True)
    sp.add_parser("show")
    a = ap.parse_args()
    if a.cmd == "catalog":
        cat = catalog(); Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        Path(a.out).write_text(json.dumps(cat, indent=1)); print({k: len(v) for k, v in cat.items()}, "→", a.out)
    elif a.cmd == "fetch":
        fetch(a.what, a.max_gb, a.include)
    elif a.cmd == "ingest":
        ingest(a.files, a.origin)
    else:
        prov = load_prov(); kinds = {}
        for v in prov.values(): kinds[v["kind"]] = kinds.get(v["kind"], 0) + 1
        print(len(prov), "fichiers", kinds)


if __name__ == "__main__":
    main()
