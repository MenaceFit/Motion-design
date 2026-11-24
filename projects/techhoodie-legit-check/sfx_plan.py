"""Timeline SFX bas Nike Trail — son adouci : compte à rebours en tons marimba + battement de cœur, révélation en cloche, impacts et blips 8-bit baissés (même grammaire que Zip Division) (v4 : + tic-tac de l'anneau, badge modèle rare ; v3 : + impacts des tampons 1:1 / LEGIT, swish du balayage) (mêmes fonctions que nrd : apparition, compte à rebours, verdicts, score, prix).
v2 : whoosh de focus sur chaque verdict, ticks de compteur sur les prix, riser avant la révélation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
INTRO = dict(q=1.18, three=2.42, counts=[3.48, 4.04, 4.92], celui=5.72, reveal=6.18, compte=6.74)
SECS = [(7.8, 11.76, 11.76, 9.4, 14.1), (14.46, 19.14, 21.38, 16.24, 22.7), (23.06, 26.18, 26.18, 24.52, 27.9)]
O = dict(alors=28.24, combien=28.72, ecris=29.54, moi=31.0, p1=31.0, revend=31.0, p2=31.0, benef=31.0, plug=31.0, dm=35.54)
for t in [0.02, INTRO["q"], INTRO["three"], INTRO["celui"], INTRO["compte"], O["alors"], O["combien"], O["ecris"], O["moi"], O["revend"], O["plug"]]:
    a(TYPE, t, 0.28)
a(f"{Z}/swoosh.wav", 0.15, 0.6); a(f"{Z}/swoosh.wav", 0.3, 0.5); a(f"{Z}/pop.wav", 0.5, 0.5); a(f"{Z}/pop.wav", 0.56, 0.45)
a(f"{J}/blipSelect_2.wav", INTRO["three"], 0.2)
S = os.path.abspath("projects/trail-legit-check/audio/soft")
for i, t in enumerate(INTRO["counts"]): a(f"{S}/count_last.wav" if i == 2 else f"{S}/count_soft.wav", t, 0.45)
for t in INTRO["counts"]: a(f"{S}/heartbeat.wav", t + 0.02, 0.35)
a(f"{Z}/rise.wav", INTRO["counts"][2] + 0.3, 0.2)                                          # tension avant révélation
a(f"{S}/reveal_bell.wav", INTRO["reveal"], 0.55); a(f"{Z}/impact.wav", INTRO["reveal"], 0.35); a(f"{Z}/impact.wav", INTRO["reveal"] + 0.44, 0.25)
a(f"{Z}/sparkle.wav", INTRO["reveal"] + 0.05, 0.4)
a(f"{Z}/pop.wav", INTRO["compte"], 0.4)
for at, fake, fakemark, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.05, 0.55); a(f"{J}/click_1.wav", at, 0.35); a(TYPE, at + 0.05, 0.26)
    a(f"{Z}/swoosh.wav", fake, 0.3)                                                          # focus carte faux
    a(f"{Z}/error.wav", fakemark, 0.35)
    a(f"{Z}/swoosh.wav", real, 0.3); a(f"{J}/pickupCoin_1.wav", real, 0.55); a(f"{Z}/sparkle.wav", real + 0.05, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.45)
    a(f"{Z}/impact.wav", fakemark + 0.19, 0.35)   # tampon 1:1
    a(f"{Z}/impact.wav", real + 0.44, 0.3); a(f"{UI}/success.wav", real + 0.44, 0.35)             # tampon LEGIT
    a(f"{Z}/swoosh.wav", at - 0.1, 0.2)                                                       # balayage
a(f"{Z}/swoosh.wav", 28.1, 0.45)


a(f"{Z}/impact.wav", O["combien"] + 0.1, 0.7); a(f"{Z}/sparkle.wav", O["combien"] + 0.15, 0.5)
a(f"{Z}/pop.wav", O["ecris"] + 0.6, 0.45)
a(f"{Z}/swoosh.wav", O["moi"] - 0.05, 0.5); a(f"{Z}/pop.wav", O["moi"] + 0.05, 0.5)
a(f"{Z}/pop.wav", O["dm"], 0.5); a(f"{UI}/notification.wav", O["dm"] + 0.16, 0.7)
a(f"{UI}/unlock.wav", 33.4, 0.4); a(f"{S}/reveal_bell.wav", 34.2, 0.45); a(f"{Z}/pop.wav", 34.25, 0.3)
missing = [e["src"] for e in ev if not os.path.exists(e["src"])]
assert not missing, missing
json.dump(ev, open("projects/techhoodie-legit-check/audio/sfx.json", "w"), indent=1)
print(len(ev), "SFX")
