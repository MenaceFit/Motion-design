"""Timeline SFX (chaque son = une fonction : apparition, verdict, score, transition). Sortie sfx.json."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
for t in [0.02, 1.12, 2.08, 5.48, 6.66, 30.86, 31.7, 32.7, 34.1, 35.7, 38.82]: a(TYPE, t, 0.30)   # texte tapé
a(f"{Z}/swoosh.wav", 0.15, 0.6); a(f"{Z}/swoosh.wav", 0.3, 0.5)                                  # entrée cartes
a(f"{Z}/pop.wav", 0.5, 0.5); a(f"{Z}/pop.wav", 0.56, 0.45)                                        # tags « ? »
a(f"{J}/blipSelect_2.wav", 2.08, 0.4)
for t in [3.04, 3.78, 4.62]: a(f"{J}/blipSelect_1.wav", t, 0.7)                                    # compte à rebours
a(f"{J}/powerUp_1.wav", 5.96, 0.7); a(f"{Z}/impact.wav", 5.96, 0.6); a(f"{J}/hitHurt_1.wav", 6.0, 0.35)  # révélation
a(f"{Z}/pop.wav", 6.66, 0.4)                                                                       # HUD score
SECS = [(7.6, 9.34, 11.08, 12.4, []), (13.06, 17.25, 16.98, 17.7, [14.54, 15.48, 16.24]),
        (18.3, 20.98, 22.12, 23.16, []), (23.88, 27.56, 25.6, 28.9, [])]
for at, fake, real, plus, checks in SECS:
    a(f"{Z}/swoosh.wav", at - 0.05, 0.55); a(f"{J}/click_1.wav", at, 0.35); a(TYPE, at + 0.05, 0.28)  # changement de détail
    a(f"{Z}/error.wav", fake, 0.55)                                                                # verdict faux
    a(f"{J}/pickupCoin_1.wav", real, 0.55)                                                         # verdict vrai
    a(f"{J}/pickupCoin_2.wav", plus, 0.45)                                                         # +1 score
    for c in checks: a(f"{Z}/tick.wav", c, 0.6)                                                    # checklist logo
a(f"{Z}/swoosh.wav", 29.9, 0.5)
a(f"{Z}/impact.wav", 31.8, 0.7); a(f"{Z}/sparkle.wav", 31.85, 0.5)                                 # ?/4
a(f"{Z}/pop.wav", 33.3, 0.45)
a(f"{Z}/swoosh.wav", 34.05, 0.5); a(f"{Z}/pop.wav", 34.15, 0.5)
a(f"{J}/pickupCoin_3.wav", 34.78, 0.7)                                                             # 50 €
a(f"{J}/pickupCoin_1.wav", 36.5, 0.7); a(f"{Z}/impact.wav", 36.5, 0.5)                             # 180 €
a(f"{UI}/level-up.wav", 37.54, 0.8); a(f"{J}/powerUp_2.wav", 37.56, 0.45)                          # +120 € bénef
for t in [37.75, 37.95, 38.15, 38.35]: a(f"{J}/pickupCoin_2.wav", t, 0.3)                          # pluie de pièces
a(f"{Z}/pop.wav", 39.84, 0.5); a(f"{UI}/notification.wav", 40.0, 0.7)                              # DM
missing = [e["src"] for e in ev if not os.path.exists(e["src"])]
assert not missing, missing
json.dump(ev, open("projects/nrd-legit-check/audio/sfx.json", "w"), indent=1)
print(len(ev), "SFX")
