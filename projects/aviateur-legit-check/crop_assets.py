"""Tech Fleece aviateur — 1:1 = annonce leboncoin (capture, filigrane exclu), vrai = photo fournie. Gros plans recadrés (sources basse déf.)."""
import os
from PIL import Image, ImageOps
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {  # (fichier, boîte en px d'affichage, largeur d'affichage)
  "full_fake":   ("fake.jpg", (20, 600, 880, 1590), 895),   "full_auth":   ("auth.jpg", (45, 150, 1040, 960), 1080),
  "pocket_fake": ("fake.jpg", (440, 780, 660, 1260), 895),  "pocket_auth": ("auth.jpg", (440, 260, 660, 720), 1080),
  "label_fake":  ("fake.jpg", (380, 690, 560, 900), 895),   "label_auth":  ("auth.jpg", (420, 170, 620, 400), 1080),
  "mat_fake":    ("fake.jpg", (140, 980, 430, 1280), 895),  "mat_auth":    ("auth.jpg", (110, 380, 420, 760), 1080),
  "logo_fake":   ("fake.jpg", (520, 1190, 760, 1380), 895), "logo_auth":   ("auth.jpg", (850, 760, 1045, 940), 1080),
}
for n, (src, b, ref) in CROPS.items():
    im = Image.open(f"src/{src}").convert("RGB"); K = im.width / ref
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
