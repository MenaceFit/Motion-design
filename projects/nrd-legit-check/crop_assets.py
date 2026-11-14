"""Recadre les photos fournies par l'utilisateur en cartes 3:4 pour la vidéo legit-check.
Coordonnées = boîte (x0,y0,x1,y1) dans l'image source ; rot = rotation (deg, sens horaire)."""
import sys, os
from PIL import Image, ImageOps
U = sys.argv[1]; OUT = "assets"
SRC = {"f_front": "21540267-image.png", "f_back": "e992cd5d-image.png", "f_label": "64f327e5-image.png",
       "a_front": "eafb0cde-image.jpg", "a_back": "ed9eff6c-image.jpg", "a_label": "28811575-image.jpg",
       "a_leg": "42e27935-image.jpg"}
CROPS = {
  "full_fake":   ("f_front", (0, 0, 451, 562), 0),
  "full_auth":   ("a_front", (40, 20, 1130, 1500), 0),
  "color_fake":  ("f_front", (20, 0, 431, 290), 0),
  "color_auth":  ("a_front", (90, 40, 1090, 760), 0),
  "logo_fake":   ("f_front", (300, 110, 425, 220), 0),
  "logo_auth":   ("a_front", (745, 470, 955, 750), 0),
  "label_fake":  ("f_label", (40, 70, 420, 420), 0),
  "label_auth":  ("a_label", (560, 150, 1010, 1060), 270),
  "grid_fake":   ("f_front", (40, 330, 270, 562), 0),
  "grid_auth":   ("a_leg", (200, 260, 760, 1010), 0),
}
os.makedirs(OUT, exist_ok=True)
for name, (src, box, rot) in CROPS.items():
    im = Image.open(os.path.join(U, SRC[src])).convert("RGB").crop(box)
    if rot: im = im.rotate(-rot, expand=True)
    im = ImageOps.fit(im, (720, 960), Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg", quality=92)
print("ok")
