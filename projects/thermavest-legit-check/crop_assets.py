"""Gilet Nike Therma-FIT ADV — vrai : photos 1-2 fournies, 1:1 : photos 3-4 fournies → cartes 3:4."""
import sys, os
from PIL import Image, ImageOps
U = sys.argv[1]; OUT = "assets"; os.makedirs(OUT, exist_ok=True)
A1, A2, F1, F2 = "e310ae41-image.webp", "1a622305-image.jpg", "d0b458ae-image.jpg", "3ed2eeee-image.jpg"
CROPS = {
  "full_auth":    (A1, (60, 180, 840, 1200)),
  "bubbles_auth": (A1, (520, 280, 780, 627)),
  "cord_auth":    (A2, (150, 520, 930, 1560)),
  "label_auth":   (A2, (200, 940, 810, 1753)),
  "full_fake":    (F1, (100, 560, 1060, 1840)),
  "bubbles_fake": (F1, (520, 760, 920, 1293)),
  "cord_fake":    (F2, (150, 690, 930, 1730)),
  "label_fake":   (F2, (210, 880, 830, 1707)),
}
for n, (src, box) in CROPS.items():
    ImageOps.fit(Image.open(os.path.join(U, src)).convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
