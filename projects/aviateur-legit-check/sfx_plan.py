"""SFX Tech Fleece aviateur (howto, 4 étapes, fin groupe) — palette douce (tools/soft_sfx.py) : cloche, marimba, impacts discrets."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib"); S = os.path.abspath("projects/trail-legit-check/audio/soft")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
REVEAL = 2.82
a(f"{Z}/swoosh.wav", 0.15, 0.45); a(f"{Z}/swoosh.wav", 0.3, 0.4); a(TYPE, 0.02, 0.22); a(TYPE, 1.0, 0.22)
a(f"{S}/count_soft.wav", 1.0, 0.3); a(f"{Z}/rise.wav", REVEAL - 1.0, 0.18)
a(f"{S}/reveal_bell.wav", REVEAL, 0.5); a(f"{Z}/impact.wav", REVEAL, 0.3); a(f"{Z}/pop.wav", REVEAL + 0.1, 0.35)
a(f"{Z}/impact.wav", REVEAL + 0.24, 0.3); a(f"{Z}/impact.wav", REVEAL + 0.44, 0.25); a(f"{UI}/success.wav", REVEAL + 0.44, 0.3)
SECS = [(4.7, 6.46, 6.46, 9.56, 12.1), (12.36, 14.18, 16.8, 18.28, 20.3), (20.58, 22.12, 23.52, 24.38, 26.1), (26.4, 27.66, 31.0, 31.4, 34.0)]
for at, fake, fm, real, plus in SECS:
    a(f"{Z}/swoosh.wav", at - 0.1, 0.25); a(f"{J}/click_1.wav", at, 0.25); a(TYPE, at + 0.05, 0.22); a(f"{Z}/pop.wav", at + 0.02, 0.3)
    a(f"{Z}/swoosh.wav", fake, 0.25); a(f"{Z}/error.wav", fm, 0.3); a(f"{Z}/impact.wav", fm + 0.19, 0.3)
    a(f"{Z}/swoosh.wav", real, 0.25); a(f"{S}/count_soft.wav", real, 0.3); a(f"{Z}/sparkle.wav", real + 0.05, 0.25)
    a(f"{Z}/impact.wav", real + 0.44, 0.25); a(f"{UI}/success.wav", real + 0.44, 0.3)
    a(f"{J}/pickupCoin_2.wav", plus, 0.35)
a(f"{Z}/swoosh.wav", 34.42, 0.4); a(TYPE, 34.52, 0.22)
for k in range(5): a(f"{Z}/tick.wav", 35.54 + k * 0.08, 0.25)
a(f"{J}/pickupCoin_3.wav", 35.96, 0.45)
for k in range(5): a(f"{Z}/tick.wav", 37.06 + k * 0.08, 0.25)
a(f"{J}/pickupCoin_1.wav", 37.48, 0.45)
a(f"{S}/count_last.wav", 38.6, 0.4); a(f"{UI}/level-up.wav", 38.62, 0.5)
for t in [0.2, 0.4, 0.6, 0.8]: a(f"{J}/pickupCoin_2.wav", 38.6 + t, 0.18)
a(f"{Z}/swoosh.wav", 39.9, 0.4); a(TYPE, 40.0, 0.22); a(f"{UI}/unlock.wav", 41.6, 0.4)
a(f"{S}/reveal_bell.wav", 42.34, 0.45); a(f"{Z}/pop.wav", 42.4, 0.3)
a(f"{Z}/pop.wav", 43.6, 0.4); a(f"{UI}/notification.wav", 43.76, 0.5)
miss = [e["src"] for e in ev if not os.path.exists(e["src"])]; assert not miss, miss
json.dump(ev, open("projects/aviateur-legit-check/audio/sfx.json", "w"), indent=1); print(len(ev), "SFX")
