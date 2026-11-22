"""SFX veste UA hybrid blanche (howto, 3 étapes, sans prix) — palette douce (tools/soft_sfx.py) : cloche, marimba, impacts discrets."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
REVEAL = 3.7
a(f"{Z}/swoosh.wav", 0.15, 0.45); a(f"{Z}/swoosh.wav", 0.3, 0.4); a(TYPE, 0.02, 0.22); a(TYPE, 1.12, 0.22)
a(f"{S}/count_soft.wav", 1.12, 0.3); a(f"{Z}/rise.wav", REVEAL - 1.0, 0.18)
a(f"{S}/reveal_bell.wav", REVEAL, 0.5); a(f"{Z}/impact.wav", REVEAL, 0.3); a(f"{Z}/pop.wav", REVEAL + 0.1, 0.35)
a(f"{Z}/impact.wav", REVEAL + 0.24, 0.3); a(f"{Z}/impact.wav", REVEAL + 0.44, 0.25); a(f"{UI}/success.wav", REVEAL + 0.44, 0.3)
SECS = [(5.44, 7.12, 7.12, 10.62, 13.4), (13.86, 15.44, 17.9, 19.04, 21.3), (21.74, 24.28, 24.28, 26.38, 28.0)]
for at, fake, fm, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.1, 0.25); a(f"{J}/click_1.wav", at, 0.25); a(TYPE, at + 0.05, 0.22); a(f"{Z}/pop.wav", at + 0.02, 0.3)
    a(f"{Z}/swoosh.wav", fake, 0.25); a(f"{Z}/error.wav", fm, 0.3); a(f"{Z}/impact.wav", fm + 0.19, 0.3)
    a(f"{Z}/swoosh.wav", real, 0.25); a(f"{S}/count_soft.wav", real, 0.3); a(f"{Z}/sparkle.wav", real + 0.05, 0.25)
    a(f"{Z}/impact.wav", real + 0.44, 0.25); a(f"{UI}/success.wav", real + 0.44, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.35)
a(f"{Z}/swoosh.wav", 28.15, 0.4); a(TYPE, 28.32, 0.22)
for i in range(3): a(f"{UI}/check.wav", 28.62 + i * 0.22 + 0.12, 0.4)
a(f"{S}/reveal_bell.wav", 30.32, 0.4); a(f"{UI}/badge.wav", 30.35, 0.35)
a(f"{Z}/swoosh.wav", 32.06, 0.4); a(TYPE, 32.16, 0.22)
a(f"{Z}/pop.wav", 33.0, 0.4); a(f"{UI}/notification.wav", 33.16, 0.5)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/uawhite-legit-check/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
