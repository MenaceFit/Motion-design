"""Timeline SFX Phenom Elite (mêmes fonctions que nrd : apparition, compte à rebours, verdicts, score, prix).
v2 : whoosh de focus sur chaque verdict, ticks de compteur sur les prix, riser avant la révélation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
INTRO = dict(q=1.12, three=2.44, counts=[3.42, 4.06, 4.94], celui=5.94, reveal=6.5, compte=7.16)
SECS = [(8.22, 10.12, 10.12, 12.66, 14.3), (15.08, 17.14, 18.26, 19.86, 20.9), (21.62, 23.28, 23.28, 25.38, 26.6)]
O = dict(alors=27.36, combien=27.86, ecris=28.74, moi=30.24, p1=31.0, revend=31.86, p2=32.8, benef=33.82, plug=35.58, dm=36.44)
for t in [0.02, INTRO["q"], INTRO["three"], INTRO["celui"], INTRO["compte"], O["alors"], O["combien"], O["ecris"], O["moi"], O["revend"], O["plug"]]:
    a(TYPE, t, 0.28)
a(f"{Z}/swoosh.wav", 0.15, 0.6); a(f"{Z}/swoosh.wav", 0.3, 0.5); a(f"{Z}/pop.wav", 0.5, 0.5); a(f"{Z}/pop.wav", 0.56, 0.45)
a(f"{J}/blipSelect_2.wav", INTRO["three"], 0.4)
for t in INTRO["counts"]: a(f"{J}/blipSelect_1.wav", t, 0.7)
a(f"{Z}/rise.wav", INTRO["counts"][2] + 0.3, 0.45)                                          # tension avant révélation
a(f"{J}/powerUp_1.wav", INTRO["reveal"], 0.7); a(f"{Z}/impact.wav", INTRO["reveal"], 0.65); a(f"{J}/hitHurt_1.wav", INTRO["reveal"] + 0.04, 0.35)
a(f"{Z}/sparkle.wav", INTRO["reveal"] + 0.05, 0.4)
a(f"{Z}/pop.wav", INTRO["compte"], 0.4)
for at, fake, fakemark, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.05, 0.55); a(f"{J}/click_1.wav", at, 0.35); a(TYPE, at + 0.05, 0.26)
    a(f"{Z}/swoosh.wav", fake, 0.3)                                                          # focus carte faux
    a(f"{Z}/error.wav", fakemark, 0.55)
    a(f"{Z}/swoosh.wav", real, 0.3); a(f"{J}/pickupCoin_1.wav", real, 0.55); a(f"{Z}/sparkle.wav", real + 0.05, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.45)
a(f"{Z}/swoosh.wav", 27.2, 0.5)
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
json.dump(ev, open("projects/phenom-legit-check/audio/sfx.json", "w"), indent=1)
print(len(ev), "SFX")
