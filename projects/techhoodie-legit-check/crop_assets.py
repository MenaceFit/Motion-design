"""Hoodie Tech Fleece — vrai : captures 1-3, 1:1 : captures 4-6 (annonces Vinted, zones photo seules)."""
import os
from PIL import Image, ImageOps
U = "/root/.claude/uploads/e55fd600-b45e-5e60-8026-9f5a50eefd60"; os.makedirs("assets", exist_ok=True)
A1, A2, A3, F1, F2, F3 = [f"{U}/{x}-image.jpg" for x in ["8e46f279", "0971ac20", "7f0738c3", "c3e095f8", "6d4680dc", "7288114c"]]
C = {"full_auth": (A1, (125, 640, 745, 1500)), "logo_auth": (A2, (220, 900, 760, 1560)), "label_auth": (A3, (180, 1150, 700, 1700)),
     "cord_auth": (A2, (20, 650, 520, 1150)),
     "full_fake": (F1, (0, 280, 895, 1920)), "logo_fake": (F2, (110, 900, 790, 1550)), "label_fake": (F3, (230, 950, 700, 1400)),
     "cord_fake": (F1, (290, 560, 650, 1040))}
for n, (src, b) in C.items():
    im = Image.open(src).convert("RGB"); K = im.width / 895
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"assets/{n}.jpg", quality=92)
print("ok")
