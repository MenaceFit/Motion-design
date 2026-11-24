"""Bas Under Armour hybride — vrai : captures 1-3, 1:1 : captures 4-6 (annonces Vinted, zones photo, boutons évités)."""
import os
from PIL import Image, ImageOps
U = "/root/.claude/uploads/e55fd600-b45e-5e60-8026-9f5a50eefd60"; os.makedirs("assets", exist_ok=True)
A1, A2, A3, F1, F2, F3 = [f"{U}/{x}-image.jpg" for x in ["14c36952", "b0e01cb1", "5f9cda73", "7c874df8", "d71fd552", "166f5206"]]
C = {"full_auth": (A1, (40, 420, 800, 1760), 895), "color_auth": (A1, (100, 750, 800, 1500), 895), "logo_auth": (A2, (20, 1020, 420, 1420), 895),
     "pocket_auth": (A2, (0, 560, 380, 1100), 895), "label_auth": (A3, (130, 900, 700, 1500), 895),
     "full_fake": (F1, (110, 350, 880, 1750), 895), "color_fake": (F1, (110, 700, 830, 1500), 895), "logo_fake": (F2, (240, 1000, 660, 1420), 895),
     "pocket_fake": (F2, (380, 300, 800, 900), 895), "label_fake": (F3, (300, 560, 720, 1080), 1079)}
for n, (src, b, ref) in C.items():
    im = Image.open(src).convert("RGB"); K = im.width / ref
    ImageOps.fit(im.crop(tuple(int(v * K) for v in b)), (720, 960), Image.LANCZOS).save(f"assets/{n}.jpg", quality=92)
print("ok")
