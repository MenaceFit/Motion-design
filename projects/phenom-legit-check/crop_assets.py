"""Extrait des images propres (zones sans texte incrusté) de la vidéo fournie par l'utilisateur
et les recadre en cartes 3:4. (t, (x0,y0,x1,y1)) en pixels 1080x1920."""
import sys, subprocess, os
from PIL import Image, ImageOps
V = sys.argv[1]; OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_fake":  (2.6, (60, 486, 456, 1110)),     # carte gauche de l'intro (1:1)
  "full_auth":  (2.6, (614, 486, 1024, 1110)),   # carte droite de l'intro (authentique)
  "outro_auth": (24.5, (0, 0, 1080, 1300)),      # authentique plein cadre
  "mat_fake":   (4.0, (150, 420, 900, 1320)),    # matière lisse + étiquette carton
  "mat_auth":   (10.4, (450, 520, 1080, 1300)),  # texture visible
  "label_fake": (15.2, (60, 260, 1020, 1300)),   # écriture blanche
  "label_auth": (12.8, (0, 260, 1080, 1340)),    # écriture grisée
  "lace_fake":  (19.8, (40, 480, 970, 1050)),    # lettrage fin
  "lace_auth":  (18.6, (250, 430, 850, 1230)),   # lettrage épais
}
for name, (t, box) in CROPS.items():
    tmp = f"/tmp/_f{t}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", V, "-frames:v", "1", tmp], check=True)
    im = ImageOps.fit(Image.open(tmp).convert("RGB").crop(box), (720, 960), Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg", quality=92)
print("ok")
