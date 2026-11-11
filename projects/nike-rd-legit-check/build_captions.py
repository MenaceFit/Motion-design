#!/usr/bin/env python3
"""words.json (Whisper brut) → captions.json corrigé pour l'affichage.
Corrections manuelles des erreurs de reconnaissance (vérifiées à la relecture du sens) :
  « en point » → « 1.1 » · « l'école » → « le col » · « araignés » → « araignée » · « plave » → « plug »."""
import json, sys, os
here = os.path.dirname(os.path.abspath(__file__))
w = json.load(open(os.path.join(here, "words.json")))
# 1) fusion des élisions (« d » + « 'un » → « d'un »)
m = []
for x in w:
    if m and x["text"].startswith("'"):
        m[-1]["text"] += x["text"]; m[-1]["end"] = x["end"]
    else:
        m.append(dict(x))
# 2) corrections
out = []
i = 0
while i < len(m):
    t = m[i]["text"]
    nxt = m[i + 1]["text"] if i + 1 < len(m) else ""
    if t in ("en", "l'en") and nxt.startswith("point"):
        punct = nxt[len("point"):]
        out.append({**m[i], "text": ("le " if t == "l'en" else "") + "1.1" + punct, "end": m[i + 1]["end"]}); i += 2; continue
    rep = {"-division": "Division", "l'école.": "le col.", "araignés.": "araignée.", "plave.": "plug."}
    out.append({**m[i], "text": rep.get(t, t)}); i += 1
ACC = {"authentique", "1.1", "couleur", "claire", "foncée", "col", "grisée", "blanche", "araignée",
       "tracés", "grossiers", "30", "80", "le"}
for x in out:
    x["accent"] = x["text"].strip(".,?!").lower().split(" ")[-1].split("'")[-1] in ACC and x["text"] != "le"
json.dump(out, open(os.path.join(here, "captions.json"), "w"), ensure_ascii=False, indent=0)
print(" ".join(x["text"] for x in out))
