"""SFX format « comment différencier » (pas de compte à rebours ni de score) — mêmes fonctions que la version quiz."""
import json, os
L = os.path.abspath("templates/remotion-kinetic/public/sfxlib")
J, Z, UI = f"{L}/jsfxr", f"{L}/zzfx", f"{L}/uisfx/cinematic"
ev = []
def a(src, at, vol): ev.append({"src": src, "at": round(at, 3), "volume": vol})
TYPE = f"{UI}/typing.wav"
Q, REVEAL = 0.96, 2.6
SECS = [(5.1, 7.02, 7.02, 9.74, 11.4), (12.06, 13.6, 15.68, 17.1, 18.5), (19.24, 20.8, 20.8, 23.76, 25.6)]
O = dict(moi=26.26, p1=27.26, revend=27.78, p2=28.88, benef=29.84, plug=31.3, dm=32.16)
for t in [0.02, Q, O["moi"], O["revend"], O["plug"]]: a(TYPE, t, 0.28)
a(f"{Z}/swoosh.wav", 0.15, 0.6); a(f"{Z}/swoosh.wav", 0.3, 0.5)
a(f"{Z}/rise.wav", REVEAL - 1.0, 0.35)
a(f"{J}/powerUp_1.wav", REVEAL, 0.6); a(f"{Z}/impact.wav", REVEAL, 0.6); a(f"{Z}/pop.wav", REVEAL + 0.1, 0.5)   # tags + VS
a(f"{Z}/impact.wav", REVEAL + 0.24, 0.45); a(f"{J}/hitHurt_1.wav", REVEAL + 0.24, 0.3)                         # tampon 1:1
a(f"{Z}/impact.wav", REVEAL + 0.44, 0.45); a(f"{UI}/success.wav", REVEAL + 0.44, 0.35)                         # tampon LEGIT
a(f"{Z}/sparkle.wav", REVEAL + 0.05, 0.4)
for at, fake, fakemark, real, plus in SECS:
    a(f"{J}/laserShoot_1.wav", at - 0.1, 0.2); a(f"{Z}/swoosh.wav", at - 0.05, 0.55); a(f"{J}/click_1.wav", at, 0.35); a(TYPE, at + 0.05, 0.26)
    a(f"{Z}/pop.wav", at + 0.02, 0.4)                                               # HUD / chip étape
    a(f"{Z}/swoosh.wav", fake, 0.3); a(f"{Z}/error.wav", fakemark, 0.55)
    a(f"{Z}/impact.wav", fakemark + 0.19, 0.55); a(f"{J}/hitHurt_2.wav", fakemark + 0.19, 0.3)
    a(f"{Z}/swoosh.wav", real, 0.3); a(f"{J}/pickupCoin_1.wav", real, 0.55); a(f"{Z}/sparkle.wav", real + 0.05, 0.3)
    a(f"{Z}/impact.wav", real + 0.44, 0.5); a(f"{UI}/success.wav", real + 0.44, 0.4)
    a(f"{J}/pickupCoin_2.wav", plus, 0.45)
a(f"{Z}/swoosh.wav", O["moi"] - 0.1, 0.5); a(f"{Z}/pop.wav", O["moi"] + 0.05, 0.5)
for k in range(5): a(f"{Z}/tick.wav", O["p1"] + k * 0.08, 0.35)
a(f"{J}/pickupCoin_3.wav", O["p1"] + 0.42, 0.7)
for k in range(5): a(f"{Z}/tick.wav", O["p2"] + k * 0.08, 0.35)
a(f"{J}/pickupCoin_1.wav", O["p2"] + 0.42, 0.7); a(f"{Z}/impact.wav", O["p2"] + 0.42, 0.5)
a(f"{UI}/level-up.wav", O["benef"], 0.8); a(f"{J}/powerUp_2.wav", O["benef"] + 0.02, 0.45)
for t in [0.2, 0.4, 0.6, 0.8, 1.0]: a(f"{J}/pickupCoin_2.wav", O["benef"] + t, 0.28)
a(f"{Z}/pop.wav", O["dm"], 0.5); a(f"{UI}/notification.wav", O["dm"] + 0.16, 0.7)
missing = [e["src"] for e in ev if not os.path.exists(e["src"])]
assert not missing, missing
json.dump(ev, open("projects/underarmour-legit-check/audio/sfx_howto.json", "w"), indent=1)
print(len(ev), "SFX")
