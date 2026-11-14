"""Zoom animé sur une capture « Order summary » → MP4 vertical 1080x1920 60 fps.
Plan : plein cadre (0–0.7 s) → push-in easeInOutCubic vers le bloc Discount/Total (0.7–2.2 s)
→ micro-punch sur 0,00 € (2.2 s) → hold léger drift jusqu'à 4.5 s."""
import sys, subprocess, numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
W, H, FPS, DUR = 1080, 1920, 60, 4.5
img = Image.open(src).convert("RGB")
SS = 6  # sur-échantillonnage lanczos
hi = img.resize((img.width*SS, img.height*SS), Image.LANCZOS)
iw, ih = img.size
fit = min(W*0.94/iw, H*0.94/ih)            # échelle plein cadre
# fond : version floutée + assombrie
bg = img.resize((W, int(ih*W/iw)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
bg = bg.crop((0, (bg.height-H)//2, W, (bg.height-H)//2+H)) if bg.height >= H else bg.resize((W, H))
bg = Image.eval(bg, lambda v: int(v*0.35))
def ease(x): x = min(max(x,0),1); return 4*x**3 if x < .5 else 1-(-2*x+2)**3/2
def back(x, s=2.2): x = min(max(x,0),1); return 1+(s+1)*(x-1)**3+s*(x-1)**2
c0 = np.array([iw/2, ih/2]); c1 = np.array([iw*0.72, ih*0.68])  # centre du bloc Discount → Total
z1 = 2.0
ff = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
    "-r",str(FPS),"-i","-","-c:v","libx264","-pix_fmt","yuv420p","-crf","14",out], stdin=subprocess.PIPE)
for f in range(int(DUR*FPS)):
    t = f/FPS
    p = ease((t-0.7)/1.5)
    z = 1 + (z1-1)*p
    z *= 1 + 0.06*np.sin(np.pi*min(max((t-2.2)/0.25,0),1))   # punch
    z *= 1 + 0.025*max(t-2.45,0)/2.05                        # drift lent
    c = c0 + (c1-c0)*p
    s = fit*z                                                 # px écran par px source
    # affine écran→source haute résolution
    a = SS/s; ox = (c[0] - W/2/s)*SS; oy = (c[1] - H/2/s)*SS
    frame = bg.copy()
    layer = hi.transform((W, H), Image.AFFINE, (a,0,ox,0,a,oy), Image.BICUBIC, fillcolor=(1,2,3))
    mask = layer.convert("L").point(lambda v: 0 if v == 0 else 255)
    m = Image.new("L", hi.size, 255).transform((W,H), Image.AFFINE, (a,0,ox,0,a,oy), Image.BILINEAR, fillcolor=0)
    frame.paste(layer, (0,0), m)
    ff.stdin.write(frame.tobytes())
ff.stdin.close(); ff.wait()
