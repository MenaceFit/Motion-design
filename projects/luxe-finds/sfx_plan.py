"""SFX trouvailles semi-luxe — palette douce (soft_sfx) + transitions marquées : chaque SFX suit une animation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
# hook
a(TYPE, 0.05, 0.22)
for at in [0.15, 0.45, 0.75]: a(f"{Z}/swoosh.wav", at, 0.35); a(f"{Z}/impact.wav", at + 0.35, 0.3)   # 3 cartes qui tombent
a(f"{UI}/typing.wav", 1.34, 0.3); a(f"{UI}/purchase.wav", 1.6, 0.45)                                    # ticket qui s'imprime
a(f"{Z}/pop.wav", 2.88, 0.35); a(f"{Z}/rise.wav", 3.3, 0.25)
for k in range(8): a(f"{Z}/tick.wav", 4.74 + k * 0.07, 0.22)
a(f"{S}/reveal_bell.wav", 4.74, 0.5); a(f"{UI}/level-up.wav", 5.2, 0.45); a(f"{Z}/impact.wav", 4.74, 0.4)
for k in range(6): a(f"{J}/pickupCoin_2.wav", 4.9 + k * 0.18, 0.18)
# pas du 1.1
a(f"{Z}/swoosh.wav", 5.9, 0.4); a(TYPE, 6.0, 0.22); a(f"{Z}/pop.wav", 7.16, 0.35); a(f"{Z}/error.wav", 7.41, 0.25)
for i in range(3): a(f"{Z}/impact.wav", 8.32 + i * 0.15 + 0.12, 0.3); a(f"{UI}/success.wav", 8.32 + i * 0.15 + 0.12, 0.25)
a(f"{S}/reveal_bell.wav", 8.72, 0.4)
# articles
for at, name, paid, res, ben, hot in [(9.3, 10.64, 12.84, 15.42, 15.95, 13.66), (16.6, 17.42, 18.66, 20.98, 21.45, None), (22.0, 23.04, 24.32, 26.88, 27.6, 25.58)]:
    a(f"{Z}/swoosh.wav", at - 0.1, 0.45); a(f"{Z}/impact.wav", at + 0.35, 0.35)        # entrée de la photo
    a(f"{UI}/success.wav", at + 0.6, 0.25)                                               # tampon authentique
    a(TYPE, name, 0.22); a(f"{Z}/pop.wav", name + 0.35, 0.3)
    a(f"{S}/count_soft.wav", paid, 0.4); a(f"{Z}/pop.wav", paid, 0.3)                    # étiquette payé
    if hot: a(f"{Z}/pop.wav", hot, 0.3)
    for k in range(5): a(f"{Z}/tick.wav", res + k * 0.08, 0.22)
    a(f"{J}/pickupCoin_1.wav", res + 0.45, 0.35); a(f"{Z}/sparkle.wav", res, 0.2)        # étiquette revente + reflet
    a(f"{S}/count_last.wav", ben, 0.4); a(f"{UI}/level-up.wav", ben + 0.02, 0.35); a(f"{Z}/sparkle.wav", ben + 0.05, 0.3)
# groupe
a(f"{Z}/swoosh.wav", 27.96, 0.4); a(TYPE, 28.06, 0.22); a(f"{S}/reveal_bell.wav", 29.4, 0.4)
for i in range(4): a(f"{UI}/notification.wav", 30.28 + i * 0.38, 0.35)
a(f"{UI}/success.wav", 31.5, 0.3)
# récap
a(f"{Z}/swoosh.wav", 32.96, 0.4)
for i in range(3): a(f"{Z}/swoosh.wav", 33.06 + i * 0.18, 0.2)
for k in range(8): a(f"{Z}/tick.wav", 33.76 + k * 0.08, 0.22)
a(f"{S}/count_last.wav", 33.76, 0.4); a(f"{UI}/level-up.wav", 34.4, 0.4); a(f"{Z}/pop.wav", 34.26, 0.25)
a(f"{Z}/pop.wav", 35.32, 0.3); a(f"{S}/count_soft.wav", 35.77, 0.35)
# CTA
a(f"{Z}/swoosh.wav", 37.0, 0.4); a(TYPE, 37.1, 0.22); a(f"{S}/reveal_bell.wav", 37.66, 0.5); a(f"{UI}/notification.wav", 38.16, 0.45)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/luxe-finds/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
