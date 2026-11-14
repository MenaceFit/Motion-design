"""Images propres extraites de la vidéo utilisateur (576x1024), zones sans texte ni chip incrustés → cartes 3:4."""
import sys, subprocess, os
from PIL import Image, ImageOps
V = sys.argv[1]; OUT = "assets"; os.makedirs(OUT, exist_ok=True)
CROPS = {
  "full_fake":   (2.6, (30, 262, 268, 598)),
  "full_auth":   (2.6, (308, 262, 546, 598)),
  "pocket_fake": (8.4, (22, 338, 278, 625)),
  "pocket_auth": (5.0, (0, 240, 576, 680)),
  "logo_fake":   (13.2, (20, 340, 278, 628)),
  "logo_auth":   (13.2, (300, 340, 556, 670)),
  "label_fake":  (22.0, (20, 345, 276, 672)),
  "label_auth":  (22.0, (300, 345, 554, 672)),
}
for name, (t, box) in CROPS.items():
    tmp = f"/tmp/_tf{t}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", V, "-frames:v", "1", tmp], check=True)
    ImageOps.fit(Image.open(tmp).convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{name}.jpg", quality=92)
print("ok")
