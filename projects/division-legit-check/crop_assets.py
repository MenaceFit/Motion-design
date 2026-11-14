"""Cartes 3:4 : le 1:1 vient de la photo fournie (588x800), l'authentique de la vidéo utilisateur (576x1024),
zones sans texte ni chip incrustés."""
import sys, subprocess, os
from PIL import Image, ImageOps
FAKE, V = sys.argv[1], sys.argv[2]; OUT = "assets"; os.makedirs(OUT, exist_ok=True)
FAKE_CROPS = {"full_fake": (0, 0, 588, 800), "color_fake": (40, 120, 440, 640),
              "writing_fake": (270, 190, 460, 444), "spider_fake": (40, 380, 250, 660)}
AUTH_CROPS = {"full_auth": (2.6, (330, 262, 546, 598)), "color_auth": (12.6, (40, 290, 576, 690)),
              "writing_auth": (8.2, (140, 170, 540, 700)), "spider_auth": (25.4, (0, 140, 576, 690))}
fake = Image.open(FAKE).convert("RGB")
for n, box in FAKE_CROPS.items():
    ImageOps.fit(fake.crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
for n, (t, box) in AUTH_CROPS.items():
    tmp = f"/tmp/_dv{t}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", V, "-frames:v", "1", tmp], check=True)
    ImageOps.fit(Image.open(tmp).convert("RGB").crop(box), (720, 960), Image.LANCZOS).save(f"{OUT}/{n}.jpg", quality=92)
print("ok")
