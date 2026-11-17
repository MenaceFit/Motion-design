"""SFX promo pack — palette douce (cf. trail) : tampons prix, compteurs, cartes, checklist, CTA."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
a(f"{Z}/swoosh.wav", 0.05, 0.45); a(TYPE, 0.9, 0.22)
a(f"{Z}/impact.wav", 1.44, 0.4); a(f"{S}/count_soft.wav", 1.44, 0.35)                      # 4 €
a(f"{Z}/pop.wav", 3.32, 0.35); a(f"{S}/reveal_bell.wav", 3.62, 0.5); a(f"{Z}/impact.wav", 3.62, 0.35)   # 150 €
for k in range(6): a(f"{J}/pickupCoin_2.wav", 3.7 + k * 0.2, 0.2)
a(f"{Z}/pop.wav", 5.18, 0.4)
for at in [6.34, 11.9, 18.26, 25.02, 28.64]: a(f"{Z}/swoosh.wav", at - 0.1, 0.35); a(TYPE, at, 0.22)      # changements de scène
a(f"{Z}/pop.wav", 6.8, 0.35); a(f"{Z}/pop.wav", 7.42, 0.35); a(f"{Z}/swoosh.wav", 7.82, 0.25)
for k in range(6): a(f"{Z}/tick.wav", 9.02 + k * 0.09, 0.25)
a(f"{S}/count_last.wav", 9.6, 0.4); a(f"{UI}/level-up.wav", 9.62, 0.5)                    # +146 €
a(f"{Z}/pop.wav", 10.82, 0.35)
a(f"{Z}/error.wav", 13.1, 0.25); a(f"{S}/reveal_bell.wav", 13.96, 0.45)                    # pas la chance / les niches
for i in range(3): a(f"{Z}/swoosh.wav", 15.06 + i * 0.18, 0.25); a(f"{UI}/success.wav", 15.3 + i * 0.18, 0.2)
a(f"{Z}/pop.wav", 15.82, 0.35); a(f"{Z}/sparkle.wav", 16.9, 0.3)
a(f"{Z}/pop.wav", 18.26, 0.35)
for k in range(6): a(f"{Z}/tick.wav", 19.26 + k * 0.08, 0.25)
a(f"{S}/count_last.wav", 19.76, 0.4)
for at in [21.0, 21.92, 23.74]: a(f"{Z}/swoosh.wav", at, 0.25); a(f"{UI}/check.wav", at + 0.15, 0.45)
a(f"{Z}/pop.wav", 25.92, 0.3); a(f"{Z}/pop.wav", 27.16, 0.35); a(f"{S}/count_soft.wav", 27.66, 0.35)
a(f"{S}/reveal_bell.wav", 29.48, 0.5); a(f"{UI}/notification.wav", 29.6, 0.5); a(f"{Z}/pop.wav", 30.28, 0.4)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/pack-promo/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
