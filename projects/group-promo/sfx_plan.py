"""SFX promo groupe — rafale de tampons sur le mur de legit checks, implosion/explosion, ticket, compteur, déverrouillage, CTA."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
WALL = [0.0, 0.54, 1.3, 2.22, 2.94, 3.8, 4.2, 4.5, 4.75, 5.0]
for i, at in enumerate(WALL):
    a(f"{Z}/pop.wav", at, 0.3); a(f"{Z}/impact.wav", at + 0.12, 0.22)
    a(f"{UI}/success.wav" if i % 2 == 0 else f"{Z}/error.wav", at + 0.14, 0.2)
a(TYPE, 4.68, 0.22)
for k in range(5): a(f"{Z}/tick.wav", 7.08 + k * 0.08, 0.22)
a(f"{S}/count_last.wav", 7.08, 0.4); a(f"{Z}/impact.wav", 7.1, 0.3)
a(f"{Z}/swoosh.wav", 7.92, 0.4); a(TYPE, 8.02, 0.22); a(f"{Z}/rise.wav", 8.4, 0.3)
a(f"{S}/reveal_bell.wav", 9.58, 0.55); a(f"{Z}/impact.wav", 9.58, 0.45); a(f"{Z}/sparkle.wav", 9.62, 0.35)
a(f"{UI}/success.wav", 10.26, 0.3); a(f"{Z}/pop.wav", 11.26, 0.35)
a(f"{Z}/swoosh.wav", 12.1, 0.4)
for at in [12.24, 12.96, 13.22]: a(f"{Z}/swoosh.wav", at, 0.25); a(f"{Z}/impact.wav", at + 0.35, 0.25)
a(f"{UI}/purchase.wav", 14.4, 0.4); a(f"{Z}/pop.wav", 15.9, 0.3)
for k in range(8): a(f"{Z}/tick.wav", 16.22 + k * 0.07, 0.22)
a(f"{S}/reveal_bell.wav", 16.22, 0.45); a(f"{UI}/level-up.wav", 16.7, 0.4)
for k in range(6): a(f"{J}/pickupCoin_2.wav", 16.4 + k * 0.18, 0.16)
a(f"{Z}/swoosh.wav", 17.72, 0.4); a(TYPE, 17.82, 0.22); a(f"{Z}/impact.wav", 18.2, 0.3); a(f"{Z}/pop.wav", 18.22, 0.3)
a(f"{Z}/impact.wav", 18.76, 0.45); a(f"{S}/count_last.wav", 18.76, 0.4); a(f"{Z}/sparkle.wav", 18.8, 0.3)
a(f"{Z}/swoosh.wav", 20.16, 0.25); a(f"{Z}/pop.wav", 20.36, 0.3)
a(f"{Z}/swoosh.wav", 21.32, 0.4); a(TYPE, 21.42, 0.22); a(f"{Z}/pop.wav", 21.62, 0.3)
a(f"{UI}/unlock.wav", 23.1, 0.5); a(f"{S}/reveal_bell.wav", 23.12, 0.4)
for at in [22.74, 23.9, 24.98, 26.5]: a(f"{Z}/swoosh.wav", at, 0.2); a(f"{UI}/check.wav", at + 0.15, 0.4)
a(f"{Z}/swoosh.wav", 27.76, 0.4); a(TYPE, 27.86, 0.22); a(f"{Z}/pop.wav", 28.66, 0.25)
a(f"{Z}/pop.wav", 29.38, 0.3); a(f"{S}/count_soft.wav", 30.64, 0.35); a(f"{Z}/error.wav", 31.7, 0.25); a(f"{Z}/impact.wav", 32.0, 0.3)
a(f"{Z}/swoosh.wav", 32.8, 0.4); a(TYPE, 32.9, 0.22); a(f"{S}/reveal_bell.wav", 33.26, 0.5)
a(f"{UI}/notification.wav", 34.0, 0.5); a(f"{Z}/pop.wav", 35.04, 0.35)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/group-promo/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
