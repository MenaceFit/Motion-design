"""Timeline SFX Zip Division (v4 : + tic-tac de l'anneau, badge modèle rare ; v3 : + impacts des tampons 1:1 / LEGIT, swish du balayage) (mêmes fonctions que nrd : apparition, compte à rebours, verdicts, score, prix).
v2 : whoosh de focus sur chaque verdict, ticks de compteur sur les prix, riser avant la révélation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
INTRO = dict(q=1.28, three=2.52, counts=[3.48, 4.06, 4.92], celui=5.66, reveal=6.1, compte=6.76)
SECS = [(7.76, 9.48, 9.48, 11.8, 13.6), (14.26, 16.96, 18.06, 19.54, 20.6), (21.14, 23.18, 24.44, 26.0, 27.9)]
O = dict(alors=28.44, combien=28.92, ecris=29.7, moi=31.14, p1=31.9, revend=32.7, p2=34.42, benef=35.22, plug=36.56, dm=37.3)
for t in [0.02, INTRO["q"], INTRO["three"], INTRO["celui"], INTRO["compte"], O["alors"], O["combien"], O["ecris"], O["moi"], O["revend"], O["plug"]]:
    a(TYPE, t, 0.28)
a(f"{Z}/swoosh.wav", 0.15, 0.6); a(f"{Z}/swoosh.wav", 0.3, 0.5); a(f"{Z}/pop.wav", 0.5, 0.5); a(f"{Z}/pop.wav", 0.56, 0.45)
a(f"{J}/blipSelect_2.wav", INTRO["three"], 0.4)
for t in INTRO["counts"]: a(f"{J}/blipSelect_1.wav", t, 0.7)
a(f"{Z}/rise.wav", INTRO["counts"][2] + 0.3, 0.45)                                          # tension avant révélation
a(f"{J}/powerUp_1.wav", INTRO["reveal"], 0.7); a(f"{Z}/impact.wav", INTRO["reveal"], 0.65); a(f"{J}/hitHurt_1.wav", INTRO["reveal"] + 0.24, 0.35); a(f"{Z}/impact.wav", INTRO["reveal"] + 0.44, 0.45)
a(f"{Z}/sparkle.wav", INTRO["reveal"] + 0.05, 0.4)
a(f"{Z}/pop.wav", INTRO["compte"], 0.4)
for at, fake, fakemark, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.05, 0.55); a(f"{J}/click_1.wav", at, 0.35); a(TYPE, at + 0.05, 0.26)
    a(f"{Z}/swoosh.wav", fake, 0.3)                                                          # focus carte faux
    a(f"{Z}/error.wav", fakemark, 0.55)
    a(f"{Z}/swoosh.wav", real, 0.3); a(f"{J}/pickupCoin_1.wav", real, 0.55); a(f"{Z}/sparkle.wav", real + 0.05, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.45)
    a(f"{Z}/impact.wav", fakemark + 0.19, 0.55); a(f"{J}/hitHurt_2.wav", fakemark + 0.19, 0.3)   # tampon 1:1
    a(f"{Z}/impact.wav", real + 0.44, 0.5); a(f"{UI}/success.wav", real + 0.44, 0.4)             # tampon LEGIT
    a(f"{J}/laserShoot_1.wav", at - 0.1, 0.2)                                                       # balayage
a(f"{Z}/swoosh.wav", 28.25, 0.5)
for k in range(int((INTRO["celui"] - INTRO["counts"][0]) / 0.25)): a(f"{Z}/tick.wav", INTRO["counts"][0] + k * 0.25, 0.18)   # tic-tac anneau
a(f"{UI}/badge.wav", 32.94, 0.6); a(f"{Z}/sparkle.wav", 32.96, 0.4)   # badge modèle rare
a(f"{Z}/pop.wav", 9.63, 0.35); a(f"{Z}/pop.wav", 11.95, 0.35)   # pastilles couleur
a(f"{Z}/impact.wav", O["combien"] + 0.1, 0.7); a(f"{Z}/sparkle.wav", O["combien"] + 0.15, 0.5)
a(f"{Z}/pop.wav", O["ecris"] + 0.6, 0.45)
a(f"{Z}/swoosh.wav", O["moi"] - 0.05, 0.5); a(f"{Z}/pop.wav", O["moi"] + 0.05, 0.5)
for k in range(5): a(f"{Z}/tick.wav", O["p1"] + k * 0.08, 0.35)                               # compteur 12 €
a(f"{J}/pickupCoin_3.wav", O["p1"] + 0.42, 0.7)
for k in range(5): a(f"{Z}/tick.wav", O["p2"] + k * 0.08, 0.35)                               # compteur 90 €
a(f"{J}/pickupCoin_1.wav", O["p2"] + 0.42, 0.7); a(f"{Z}/impact.wav", O["p2"] + 0.42, 0.5)
a(f"{UI}/level-up.wav", O["benef"], 0.8); a(f"{J}/powerUp_2.wav", O["benef"] + 0.02, 0.45)
for t in [0.2, 0.4, 0.6, 0.8, 1.0]: a(f"{J}/pickupCoin_2.wav", O["benef"] + t, 0.28)
a(f"{Z}/pop.wav", O["dm"], 0.5); a(f"{UI}/notification.wav", O["dm"] + 0.16, 0.7)
missing = [e["src"] for e in ev if not os.path.exists(e["src"])]
assert not missing, missing
json.dump(ev, open("projects/division-legit-check/audio/sfx.json", "w"), indent=1)
print(len(ev), "SFX")
