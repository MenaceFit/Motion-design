"""Veste UA hybrid blanche — slideshow utilisateur (3 slides) + annonce leboncoin (1:1 d'intro, filigrane exclu)."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
S = {1: "69c65fd0-image.webp", 2: "4c5ba601-image.webp", 3: "fc17d7ea-image.webp", 4: "93eb56fc-image.jpg"}
CROPS = {  # coordonnées sur un affichage de largeur 1125 (slides) / 932 (capture)
  "full_fake":  (4, (45, 385, 890, 1440), 932),
  "full_auth":  (1, (580, 700, 1120, 1480), 1125),
  "color_fake": (1, (5, 700, 570, 1490), 1125),  "color_auth": (1, (580, 700, 1120, 1480), 1125),
  "logo_fake":  (2, (5, 530, 560, 1375), 1125),  "logo_auth":  (2, (570, 530, 1120, 1375), 1125),
  "storm_fake": (3, (5, 610, 525, 1495), 1125),  "storm_auth": (3, (522, 610, 1120, 1440), 1125),
}
for n, (i, b, ref) in CROPS.items():
    im = Image.open(f"src/{S[i]}").convert("RGB"); K = im.width / ref
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
