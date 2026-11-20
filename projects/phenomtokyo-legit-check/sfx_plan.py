"""SFX Phenom Elite Tokyo (howto, 4 étapes) — palette douce (tools/soft_sfx.py) : cloche, marimba, impacts discrets."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
REVEAL = 3.52
a(f"{Z}/swoosh.wav", 0.15, 0.45); a(f"{Z}/swoosh.wav", 0.3, 0.4); a(TYPE, 0.02, 0.22); a(TYPE, 0.96, 0.22)
a(f"{S}/count_soft.wav", 1.0, 0.3); a(f"{Z}/rise.wav", REVEAL - 1.0, 0.18)
a(f"{S}/reveal_bell.wav", REVEAL, 0.5); a(f"{Z}/impact.wav", REVEAL, 0.3); a(f"{Z}/pop.wav", REVEAL + 0.1, 0.35)
a(f"{Z}/impact.wav", REVEAL + 0.24, 0.3); a(f"{Z}/impact.wav", REVEAL + 0.44, 0.25); a(f"{UI}/success.wav", REVEAL + 0.44, 0.3)
SECS = [(5.52, 7.04, 7.04, 10.44, 12.6), (13.06, 14.82, 14.82, 17.78, 19.5), (19.94, 21.94, 22.86, 24.34, 26.4), (26.8, 28.46, 28.46, 32.5, 36.6)]
for at, fake, fm, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.1, 0.25); a(f"{J}/click_1.wav", at, 0.25); a(TYPE, at + 0.05, 0.22); a(f"{Z}/pop.wav", at + 0.02, 0.3)
    a(f"{Z}/swoosh.wav", fake, 0.25); a(f"{Z}/error.wav", fm, 0.3); a(f"{Z}/impact.wav", fm + 0.19, 0.3)
    a(f"{Z}/swoosh.wav", real, 0.25); a(f"{S}/count_soft.wav", real, 0.3); a(f"{Z}/sparkle.wav", real + 0.05, 0.25)
    a(f"{Z}/impact.wav", real + 0.44, 0.25); a(f"{UI}/success.wav", real + 0.44, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.35)
a(f"{Z}/swoosh.wav", 37.6, 0.4); a(TYPE, 37.78, 0.22)
for i in range(4): a(f"{UI}/check.wav", 38.08 + i * 0.22 + 0.12, 0.4)
a(f"{S}/reveal_bell.wav", 39.46, 0.4); a(f"{UI}/notification.wav", 39.5, 0.4)
a(f"{Z}/swoosh.wav", 41.14, 0.4); a(TYPE, 41.24, 0.22)
for k in range(5): a(f"{Z}/tick.wav", 41.76 + k * 0.08, 0.25)
a(f"{J}/pickupCoin_3.wav", 42.18, 0.45)
for k in range(5): a(f"{Z}/tick.wav", 42.94 + k * 0.08, 0.25)
a(f"{J}/pickupCoin_1.wav", 43.36, 0.45)
a(f"{S}/count_last.wav", 43.62, 0.4); a(f"{UI}/level-up.wav", 43.64, 0.5)
for t in [0.2, 0.4, 0.6, 0.8]: a(f"{J}/pickupCoin_2.wav", 43.62 + t, 0.18)
a(f"{Z}/pop.wav", 46.2, 0.4); a(f"{UI}/notification.wav", 46.36, 0.5)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/phenomtokyo-legit-check/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
