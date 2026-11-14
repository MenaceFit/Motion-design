"""Personnage pixel art original (ensemble molleton gris, casquette noire à l'envers, baskets).
Inspiré de la tenue des photos fournies, sans logo ni ressemblance avec une personne réelle.
Sortie : assets/char_<pose>.png (28x40 px agrandi x SCALE, rendu nearest-neighbor)."""
from PIL import Image
SCALE = 10
PAL = {'K': (14, 14, 18), 'C': (30, 30, 36), 'c': (52, 52, 60), 'R': (170, 40, 46), 'S': (112, 70, 44),
       's': (84, 50, 30), 'D': (40, 24, 16), 'W': (236, 238, 240), 'E': (250, 250, 250),
       'G': (186, 189, 194), 'g': (146, 150, 156), 'H': (210, 213, 217), 'Z': (34, 34, 38),
       'w': (150, 156, 162), 'X': (60, 64, 70), 'M': (60, 24, 20)}
BODY = [
"......KKKKKKKK......",
".....KCCCCCCCCK.....",
"....KCcCCCCCCCCK....",
"....KCcCCCCCCCCK....",
"....KCCCCCCCRRCK....",
"....KKKKKKKKKKKK....",
"....KSSSSSSSSSSK....",
"....KSDDSSSSDDSK....",
"....KSKESSSSKESK....",
"...KsSSSSSSSSSSsK...",
"....KSSSSsSSSSSK....",
"....KSSSDDDDSSSK....",
".....KSSSSSSSSK.....",
"......KKsSSsKK......",
"....KKHHHssHHHKK....",
"...KHHGGGZZGGGHHK...",
"...KGGGGGZZGGGGGK...",
"...KGGGGGZZGGGGGK...",
"...KGGGGGGGGGGGGK...",
"...KGGGGGGGGGGGGK...",
"...KGggggggggggGK...",
"...KGgGGGGGGGGgGK...",
"...KGGGGGGGGGGGGK...",
"...KggggggggggggK...",
"....KGGGGZZGGGGK....",
"....KGGGGGGGGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KGGGgKKgGGGK....",
"....KgggggKgggggK...",
"....KgggggKKggggK...",
"...KWWWWWKKWWWWWK...",
"...KWwwWWKKWWwwWK...",
"...KXXXXXKKXXXXXK...",
"...KKKKKKKKKKKKKK...",
]
W, H, OX = 28, 40, 4

def blank(): return [[None] * W for _ in range(H)]
def put(g, x, y, ch):
    if 0 <= x < W and 0 <= y < H: g[y][x] = ch
def body(g, mouth=False, blink=False):
    for y, row in enumerate(BODY):
        for x, ch in enumerate(row):
            if ch != '.': put(g, x + OX, y, ch)
    if blink:
        for x in (6, 7, 12, 13): put(g, x + OX, 8, 'D')
    if mouth:
        for x in (9, 10): put(g, x + OX, 11, 'M')
        put(g, 9 + OX, 12, 'K'); put(g, 10 + OX, 12, 'K')
def seg(g, pts, col='G'):
    """bras = suite de points (x,y) reliés, épaisseur 2 + contour"""
    cells = set()
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n); y = round(y0 + (y1 - y0) * i / n)
            cells |= {(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)}
    for (x, y) in cells:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if (x + dx, y + dy) not in cells and (g[y + dy][x + dx] if 0 <= x + dx < W and 0 <= y + dy < H else 1) in (None,):
                    put(g, x + dx, y + dy, 'K')
    for (x, y) in cells: put(g, x, y, col)
def hand(g, x, y, finger=None):
    seg(g, [(x, y), (x, y)], 'S')
    if finger: seg_f = finger; put(g, *seg_f, 'S')
ARMS = {
 'down':   lambda g: (seg(g, [(5, 16), (4, 23)]), hand(g, 4, 24), seg(g, [(21, 16), (22, 23)]), hand(g, 22, 24)),
 'point_r':lambda g: (seg(g, [(5, 16), (4, 23)]), hand(g, 4, 24), seg(g, [(21, 16), (25, 17)]), hand(g, 26, 17)),
 'point_l':lambda g: (seg(g, [(21, 16), (22, 23)]), hand(g, 22, 24), seg(g, [(5, 16), (1, 17)]), hand(g, 0, 17)),
 'think':  lambda g: (seg(g, [(5, 16), (4, 23)]), hand(g, 4, 24), seg(g, [(21, 16), (22, 21), (17, 15)]), hand(g, 15, 13)),
 'cheer':  lambda g: (seg(g, [(6, 15), (3, 8), (3, 5)]), hand(g, 3, 3), seg(g, [(20, 15), (23, 8), (23, 5)]), hand(g, 23, 3)),
 'shrug':  lambda g: (seg(g, [(5, 16), (3, 21), (1, 19)]), hand(g, 0, 17), seg(g, [(21, 16), (23, 21), (25, 19)]), hand(g, 25, 17)),
 'wave':   lambda g: (seg(g, [(5, 16), (4, 23)]), hand(g, 4, 24), seg(g, [(21, 16), (24, 11), (24, 7)]), hand(g, 24, 5)),
}
POSES = {'idle': ('down', 0, 0), 'blink': ('down', 0, 1), 'talk': ('down', 1, 0), 'point_r': ('point_r', 1, 0),
         'point_l': ('point_l', 1, 0), 'think': ('think', 0, 0), 'cheer': ('cheer', 1, 0), 'shrug': ('shrug', 1, 0),
         'wave': ('wave', 1, 0), 'wave_c': ('wave', 0, 0), 'point_r_c': ('point_r', 0, 0), 'shrug_c': ('shrug', 0, 0),
         'cheer_c': ('cheer', 0, 0)}
for name, (arm, mouth, blink) in POSES.items():
    g = blank(); body(g, mouth, blink); ARMS[arm](g)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            if g[y][x]: im.putpixel((x, y), PAL[g[y][x]] + (255,))
    im.resize((W * SCALE, H * SCALE), Image.NEAREST).save(f'assets/char_{name}.png')
print('ok', len(POSES))
