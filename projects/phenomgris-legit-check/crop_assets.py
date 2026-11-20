"""Bas Nike Phenom Elite gris — images du slideshow TikTok de l'utilisateur (zones photo seules). Affichage 1125 px → réel."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
S = {1: "943284b4", 2: "d0ae34f1", 3: "89af9c67"}
CROPS = {
  "full_fake":  (1, (10, 600, 570, 1400)),  "full_auth":  (1, (585, 600, 1120, 1400)),
  "color_fake": (1, (20, 880, 520, 1400)),  "color_auth": (1, (600, 880, 1100, 1400)),
  "back_fake":  (2, (5, 460, 520, 1380)),   "back_auth":  (2, (530, 460, 1120, 1380)),
  "lace_fake":  (3, (5, 465, 595, 1420)),   "lace_auth":  (3, (610, 465, 1120, 1420)),
}
for n, (i, b) in CROPS.items():
    im = Image.open(f"src/{S[i]}-image.webp").convert("RGB"); K = im.width / 1125
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
