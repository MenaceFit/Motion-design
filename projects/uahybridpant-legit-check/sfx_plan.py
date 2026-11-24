"""Timeline SFX bas Nike Trail — son adouci : compte à rebours en tons marimba + battement de cœur, révélation en cloche, impacts et blips 8-bit baissés (même grammaire que Zip Division) (v4 : + tic-tac de l'anneau, badge modèle rare ; v3 : + impacts des tampons 1:1 / LEGIT, swish du balayage) (mêmes fonctions que nrd : apparition, compte à rebours, verdicts, score, prix).
v2 : whoosh de focus sur chaque verdict, ticks de compteur sur les prix, riser avant la révélation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
INTRO = dict(q=1.16, three=2.48, counts=[3.38, 4.08, 4.9], celui=5.62, reveal=6.1, compte=6.66)
SECS = [(7.68, 13.44, 13.44, 10.12, 17.2), (17.64, 19.16, 19.16, 20.98, 22.6), (22.88, 27.24, 27.24, 24.56, 30.0), (30.36, 32.5, 33.96, 35.56, 37.7)]
O = dict(alors=38.08, combien=38.46, ecris=39.26, moi=40.9, p1=41.64, revend=42.54, p2=43.18, benef=44.08, plug=45.76, dm=48.86)
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
a(f"{Z}/swoosh.wav", 37.9, 0.45)


a(f"{Z}/impact.wav", O["combien"] + 0.1, 0.7); a(f"{Z}/sparkle.wav", O["combien"] + 0.15, 0.5)
a(f"{Z}/pop.wav", O["ecris"] + 0.6, 0.45)
a(f"{Z}/swoosh.wav", O["moi"] - 0.05, 0.5); a(f"{Z}/pop.wav", O["moi"] + 0.05, 0.5)
for k in range(5): a(f"{Z}/tick.wav", O["p1"] + k * 0.08, 0.35)                               # compteur 12 €
a(f"{J}/pickupCoin_3.wav", O["p1"] + 0.42, 0.7)
for k in range(5): a(f"{Z}/tick.wav", O["p2"] + k * 0.08, 0.35)                               # compteur 90 €
a(f"{J}/pickupCoin_1.wav", O["p2"] + 0.42, 0.7); a(f"{Z}/impact.wav", O["p2"] + 0.42, 0.5)
a(f"{UI}/level-up.wav", O["benef"], 0.8); a(f"{J}/powerUp_2.wav", O["benef"] + 0.02, 0.45)
for t in [0.2, 0.4, 0.6, 0.8, 1.0]: a(f"{J}/pickupCoin_2.wav", O["benef"] + t, 0.28)
a(f"{Z}/pop.wav", O["dm"], 0.5); a(f"{S}/reveal_bell.wav", O["dm"] + 0.1, 0.5); a(f"{UI}/unlock.wav", 47.2, 0.35)
missing = [e["src"] for e in ev if not os.path.exists(e["src"])]
assert not missing, missing
json.dump(ev, open("projects/uahybridpant-legit-check/audio/sfx.json", "w"), indent=1)
print(len(ev), "SFX")
