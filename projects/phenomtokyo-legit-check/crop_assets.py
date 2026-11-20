"""Bas Nike Phenom Elite Tokyo — images tirées du slideshow TikTok de l'utilisateur (@ak4run), zones photo seules
(sans titres, légendes ni filigrane). Coordonnées mesurées sur un affichage 1125 px de large → ×1.104."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True); K = 1242 / 1125
S = {1: "8e8dd776", 2: "8dced8cb", 3: "41f3d37c", 4: "d8b19be7", 5: "27683c6f"}
CROPS = {
  "full_fake":   (1, (10, 690, 585, 1470)),   "full_auth":   (1, (600, 690, 1115, 1440)),
  "logo_fake":   (2, (10, 860, 505, 1440)),   "logo_auth":   (2, (535, 860, 1120, 1420)),
  "back_fake":   (3, (10, 660, 545, 1490)),   "back_auth":   (3, (555, 660, 1120, 1430)),
  "pocket_fake": (4, (10, 655, 550, 1420)),   "pocket_auth": (4, (565, 655, 1120, 1415)),
  "label_fake":  (5, (10, 695, 560, 1460)),   "label_auth":  (5, (572, 695, 1120, 1440)),
}
for n, (i, b) in CROPS.items():
    im = Image.open(f"src/{S[i]}-image.webp").convert("RGB").crop(tuple(int(v * K) for v in b))
    ImageOps.fit(im, (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
