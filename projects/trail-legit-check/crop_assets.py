"""Bas Nike Trail — vrai : images 1-2 (devant, étiquette), 1:1 : images 3-5 (devant, logo, étiquette)."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_auth":   ("auth_front.png", (20, 15, 426, 653)),
  "mat_auth":    ("auth_front.png", (130, 120, 330, 420)),
  "logo_auth":   ("auth_front.png", (230, 180, 400, 407)),
  "label_auth":  ("auth_label.png", (60, 120, 480, 545)),
  "full_fake":   ("fake_front.png", (60, 20, 470, 679)),
  "mat_fake":    ("fake_front.png", (90, 300, 330, 620)),
  "logo_fake":   ("fake_logo.png", (130, 270, 410, 640)),
  "label_fake":  ("fake_label.png", (40, 180, 460, 600)),
}
for n, (src, box) in CROPS.items():
    ImageOps.fit(Image.open(f"src/{src}").convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
