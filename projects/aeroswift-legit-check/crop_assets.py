"""Bas Nike AeroSwift — 1:1 : images 1-2 (étiquette blanche, devant), vrai : images 3-5 (étiquette grisée, dos, devant)."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_fake":   ("fake_front.png", (0, 30, 323, 460)),
  "logo_fake":   ("fake_front.png", (150, 80, 333, 324)),
  "label_fake":  ("fake_label.png", (10, 100, 290, 467)),
  "hybrid_fake": ("fake_front.png", (40, 250, 300, 570)),
  "full_auth":   ("auth_front.png", (0, 20, 336, 468)),
  "logo_auth":   ("auth_front.png", (150, 110, 336, 358)),
  "label_auth":  ("auth_label.png", (120, 140, 400, 513)),
  "hybrid_auth": ("auth_back.png", (0, 180, 300, 579)),
}
for n, (src, box) in CROPS.items():
    ImageOps.fit(Image.open(f"src/{src}").convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
