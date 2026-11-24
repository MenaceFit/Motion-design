"""SFX trouvailles #2 — palette douce, chaque son suit une animation (hook ticket, preuve Certilogo, 3 articles, pack, CTA)."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
a(TYPE, 0.05, 0.22)
for at in [0.15, 0.45, 0.75]: a(f"{Z}/swoosh.wav", at, 0.35); a(f"{Z}/impact.wav", at + 0.35, 0.3)
a(TYPE, 1.3, 0.3); a(f"{UI}/purchase.wav", 1.55, 0.45)
a(f"{Z}/pop.wav", 2.86, 0.35); a(f"{Z}/rise.wav", 3.25, 0.25)
for k in range(8): a(f"{Z}/tick.wav", 4.68 + k * 0.07, 0.22)
a(f"{S}/reveal_bell.wav", 4.68, 0.5); a(f"{UI}/level-up.wav", 5.15, 0.45); a(f"{Z}/impact.wav", 4.68, 0.4)
for k in range(6): a(f"{J}/pickupCoin_2.wav", 4.85 + k * 0.18, 0.18)
# preuve
a(f"{Z}/swoosh.wav", 5.82, 0.4); a(TYPE, 5.92, 0.22); a(f"{Z}/pop.wav", 7.08, 0.35); a(f"{Z}/error.wav", 7.33, 0.25)
a(f"{Z}/swoosh.wav", 7.8, 0.4); a(f"{Z}/impact.wav", 8.2, 0.3); a(f"{Z}/swoosh.wav", 8.1, 0.3); a(f"{Z}/impact.wav", 8.5, 0.25)
a(f"{UI}/scanning.wav", 9.68, 0.35); a(f"{Z}/sparkle.wav", 9.7, 0.3); a(f"{Z}/pop.wav", 9.93, 0.3)
a(f"{UI}/notification.wav", 11.4, 0.45); a(f"{UI}/success.wav", 11.7, 0.4); a(f"{S}/reveal_bell.wav", 11.72, 0.4)
# articles
for at, name, paid, res, ben, chip in [(12.26, 13.3, 15.1, 18.0, 18.45, 16.24), (18.76, 19.56, 21.28, 23.36, 23.85, 23.36), (24.5, 25.52, 26.96, 28.88, 29.9, None)]:
    a(f"{Z}/swoosh.wav", at - 0.1, 0.45); a(f"{Z}/impact.wav", at + 0.35, 0.35); a(f"{UI}/success.wav", at + 0.6, 0.25)
    a(TYPE, name, 0.22); a(f"{Z}/pop.wav", name + 0.35, 0.3)
    a(f"{S}/count_soft.wav", paid, 0.4); a(f"{Z}/pop.wav", paid, 0.3)
    if chip: a(f"{Z}/pop.wav", chip, 0.28)
    for k in range(5): a(f"{Z}/tick.wav", res + k * 0.08, 0.22)
    a(f"{J}/pickupCoin_1.wav", res + 0.45, 0.35); a(f"{Z}/sparkle.wav", res, 0.2)
    a(f"{S}/count_last.wav", ben, 0.4); a(f"{UI}/level-up.wav", ben + 0.02, 0.35); a(f"{Z}/sparkle.wav", ben + 0.05, 0.3)
# pack
a(f"{Z}/swoosh.wav", 30.28, 0.4); a(TYPE, 30.38, 0.22); a(f"{S}/reveal_bell.wav", 31.32, 0.4)
for at in [32.92, 33.68, 35.06]: a(f"{Z}/swoosh.wav", at, 0.2); a(f"{UI}/check.wav", at + 0.15, 0.45)
# récap
a(f"{Z}/swoosh.wav", 35.92, 0.4)
for i in range(3): a(f"{Z}/swoosh.wav", 36.02 + i * 0.18, 0.2)
for k in range(8): a(f"{Z}/tick.wav", 36.72 + k * 0.08, 0.22)
a(f"{S}/count_last.wav", 36.72, 0.4); a(f"{UI}/level-up.wav", 37.36, 0.4); a(f"{Z}/pop.wav", 37.22, 0.25)
a(f"{Z}/pop.wav", 38.06, 0.3); a(f"{S}/count_soft.wav", 38.51, 0.35)
# CTA
a(f"{Z}/swoosh.wav", 40.0, 0.4); a(TYPE, 40.1, 0.22); a(f"{S}/reveal_bell.wav", 40.66, 0.5); a(f"{UI}/notification.wav", 41.16, 0.45)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/luxe-finds2/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
