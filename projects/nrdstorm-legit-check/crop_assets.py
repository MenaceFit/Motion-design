"""Bas NRD Storm-FIT bleu — vrai : captures 1-3, 1:1 : captures 4-5 (annonces Vinted, zones photo seules, boutons évités)."""
import os
from PIL import Image, ImageOps
U = "/root/.claude/uploads/e55fd600-b45e-5e60-8026-9f5a50eefd60"; os.makedirs("assets", exist_ok=True)
A1, A2, F1, F2 = [f"{U}/{x}-image.jpg" for x in ["4e4731f5", "f79b38be", "3412cd04", "e1759e79"]]
C = {"full_auth": (A1, (115, 430, 800, 1720)), "color_auth": (A1, (130, 650, 800, 1300)), "spider_auth": (A1, (130, 1060, 460, 1700)),
     "label_auth": (A2, (150, 880, 600, 1320)),
     "full_fake": (F1, (110, 480, 800, 1720)), "color_fake": (F1, (130, 650, 800, 1300)), "spider_fake": (F1, (130, 1110, 460, 1720)),
     "label_fake": (F2, (170, 700, 620, 1160))}
for n, (src, b) in C.items():
    im = Image.open(src).convert("RGB"); K = im.width / 895
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"assets/{n}.jpg", quality=92)
print("ok")
