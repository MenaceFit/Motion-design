"""Gilet Therma-FIT ADV menthe — vrai : images 1-3 (sifflet, bulles gonflées, écriture réfléchissante),
1:1 : images 4-5 (bulles plates, pas de sifflet, écriture noire épaisse) → cartes 3:4 (sources basse déf.)."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_auth":    ("auth_front.png", (0, 40, 245, 370)),
  "bubbles_auth": ("auth_back.png", (20, 60, 220, 327)),
  "cord_auth":    ("auth_front.png", (40, 40, 210, 267)),
  "back_auth":    ("auth_back.png", (105, 243, 245, 423)),
  "full_fake":    ("fake_front.png", (0, 0, 345, 460)),
  "bubbles_fake": ("fake_back.png", (40, 80, 300, 427)),
  "cord_fake":    ("fake_front.png", (40, 0, 300, 347)),
  "back_fake":    ("fake_back.png", (130, 380, 290, 593)),
}
for n, (src, box) in CROPS.items():
    ImageOps.fit(Image.open(f"src/{src}").convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
