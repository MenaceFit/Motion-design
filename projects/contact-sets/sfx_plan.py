"""SFX contact ensembles — palette douce (soft_sfx), chaque son suit une animation."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
a(TYPE, 0.05, 0.22); a(f"{Z}/swoosh.wav", 0.1, 0.4); a(f"{Z}/impact.wav", 0.5, 0.3)
a(f"{Z}/pop.wav", 1.12, 0.35); a(f"{S}/count_soft.wav", 1.12, 0.3)
a(TYPE, 2.64, 0.22); a(f"{Z}/rise.wav", 2.8, 0.2)
a(f"{Z}/swoosh.wav", 3.41, 0.25); a(f"{Z}/impact.wav", 3.46, 0.5); a(f"{S}/reveal_bell.wav", 3.46, 0.5); a(f"{UI}/level-up.wav", 3.5, 0.35)
a(f"{Z}/pop.wav", 3.81, 0.35)
for k in range(6): a(f"{J}/pickupCoin_2.wav", 3.6 + k * 0.18, 0.16)
a(f"{Z}/swoosh.wav", 4.46, 0.45); a(TYPE, 4.56, 0.22); a(f"{Z}/impact.wav", 4.95, 0.3)
a(f"{S}/count_soft.wav", 5.6, 0.35); a(f"{Z}/pop.wav", 5.6, 0.3)
for k in range(5): a(f"{Z}/tick.wav", 8.86 + k * 0.08, 0.22)
a(f"{J}/pickupCoin_1.wav", 9.3, 0.35); a(f"{Z}/sparkle.wav", 8.86, 0.25); a(f"{Z}/pop.wav", 9.6, 0.3)
a(f"{S}/count_last.wav", 9.36, 0.35)
a(f"{Z}/swoosh.wav", 10.24, 0.45); a(f"{Z}/impact.wav", 10.7, 0.3); a(f"{Z}/pop.wav", 11.14, 0.3); a(f"{Z}/error.wav", 11.39, 0.22)
for i in range(2): a(f"{Z}/impact.wav", 12.04 + i * 0.15 + 0.12, 0.3); a(f"{UI}/success.wav", 12.04 + i * 0.15 + 0.12, 0.25)
a(f"{S}/reveal_bell.wav", 12.4, 0.4)
a(f"{Z}/swoosh.wav", 13.04, 0.45); a(TYPE, 13.14, 0.22); a(f"{Z}/pop.wav", 14.52, 0.4)
a(f"{UI}/success.wav", 15.74, 0.3)
a(f"{UI}/unlock.wav", 18.66, 0.5); a(f"{S}/reveal_bell.wav", 18.7, 0.45); a(f"{Z}/sparkle.wav", 18.75, 0.3); a(f"{Z}/pop.wav", 18.86, 0.3)
a(f"{Z}/swoosh.wav", 19.8, 0.45); a(TYPE, 19.9, 0.22); a(f"{S}/count_last.wav", 20.2, 0.35)
a(f"{UI}/notification.wav", 20.82, 0.5); a(f"{Z}/pop.wav", 24.5, 0.35); a(f"{UI}/success.wav", 24.55, 0.3)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/contact-sets/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
