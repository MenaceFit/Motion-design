"""Trouvailles 2 : Burberry Ramsey, Stone Island Soft Shell-R noire, Stone Island bleu marine (filigrane Gemini recadré)."""
import os
from PIL import Image, ImageOps
U = "/root/.claude/uploads/e55fd600-b45e-5e60-8026-9f5a50eefd60"; os.makedirs("assets", exist_ok=True)
bb = Image.open(f"{U}/28a9b65f-image.png").convert("RGB").crop((0, 250, 1600, 1350))
ImageOps.pad(bb, (720, 960), color=(255, 255, 255), centering=(0.5, 0.5)).save("assets/burberry.jpg", quality=93)
ImageOps.fit(Image.open(f"{U}/0ed51d17-image.png").convert("RGB"), (720, 960), Image.LANCZOS).save("assets/black.jpg", quality=93)
ImageOps.fit(Image.open(f"{U}/70bb7775-image.png").convert("RGB").crop((0, 0, 325, 440)), (720, 960), Image.LANCZOS).save("assets/navy.jpg", quality=93)
ImageOps.fit(Image.open(f"{U}/cd843fce-image.png").convert("RGB").crop((0, 60, 290, 520)), (720, 960), Image.LANCZOS).save("assets/certilogo.jpg", quality=93)
ImageOps.fit(Image.open(f"{U}/e0188614-image.png").convert("RGB"), (720, 960), Image.LANCZOS).save("assets/softshell_label.jpg", quality=93)
print("ok")
