"""Cartes 3:4 — 1:1 : photos 4-6 fournies (annonce, filigrane exclu du cadrage) ; vrai : photos 7-10 fournies.
Les 3 captures « différences » (contenu d'un autre créateur) servent seulement d'apprentissage, jamais à l'écran."""
import sys, os
from PIL import Image, ImageOps
U = sys.argv[1]; OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_fake":  ("2819a543-image.jpg", (60, 395, 1020, 1645)),
  "panel_fake": ("2819a543-image.jpg", (150, 900, 950, 1645)),
  "logo_fake":  ("ab2f55be-image.jpg", (30, 180, 330, 580)),
  "back_fake":  ("1d4abc7c-image.jpg", (100, 545, 990, 1680)),
  "full_auth":  ("4d5cb843-image.jpg", (0, 0, 1074, 1891)),
  "panel_auth": ("4d5cb843-image.jpg", (60, 950, 1040, 1891)),
  "logo_auth":  ("adfaeb6f-image.jpg", (330, 820, 930, 1620)),
  "back_auth":  ("0c2ebbad-image.jpg", (0, 150, 1080, 1866)),
}
for n, (src, box) in CROPS.items():
    ImageOps.fit(Image.open(os.path.join(U, src)).convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
