"""Blender headless (bpy) — scène test style « Golden Neuro » (famille ref02).
Fond noir, matériau or satiné, rim light chaude, petite rotation caméra.
Usage : python3 templates/blender/gold_bust_test.py out_dir [--frames 1] [--samples 32]
Rend en Cycles CPU (EEVEE nécessite un GPU/OpenGL, absent dans le conteneur cloud).
"""
import sys, math, argparse, bpy

ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--frames", type=int, default=1)
ap.add_argument("--samples", type=int, default=32); ap.add_argument("--res", default="540x960")
a = ap.parse_args(sys.argv[1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
w, h = map(int, a.res.split("x"))
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = a.samples; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = w, h
sc.render.fps = 30; sc.frame_start, sc.frame_end = 1, a.frames
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - High Contrast"
sc.world = bpy.data.worlds.new("W"); sc.world.use_nodes = True
bg = sc.world.node_tree.nodes.get("Background")
if bg: bg.inputs["Strength"].default_value = 0.0  # fond noir pur (sinon gris par défaut)

# Matériau or satiné
gold = bpy.data.materials.new("Gold"); gold.use_nodes = True
bsdf = gold.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.93, 0.62, 0.22, 1)
bsdf.inputs["Metallic"].default_value = 1.0; bsdf.inputs["Roughness"].default_value = 0.32

# « Buste » stylisé : tête (sphère) + cou + épaules (cylindre aplati), lissés
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 1.6), segments=64, ring_count=32)
head = bpy.context.object; head.scale = (0.85, 0.95, 1.1)
bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.8, location=(0, 0, 0.5))
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, -0.6), segments=64, ring_count=32)
bpy.context.object.scale = (1.8, 0.9, 0.8)
for o in bpy.data.objects:
    if o.type == "MESH":
        o.data.materials.append(gold)
        for poly in o.data.polygons: poly.use_smooth = True  # lissage par face (shade_smooth n'agit que sur la sélection)

# Éclairage : key douce + rim chaude arrière + fill froid très faible
def area(name, loc, rot, power, color, size):
    l = bpy.data.lights.new(name, "AREA"); l.energy = power; l.color = color; l.size = size
    o = bpy.data.objects.new(name, l); o.location = loc; o.rotation_euler = rot; sc.collection.objects.link(o)
area("Key", (3, -3, 4), (math.radians(50), 0, math.radians(45)), 900, (1, .92, .8), 3)
area("Rim", (-2, 3, 3), (math.radians(-60), 0, math.radians(-150)), 1500, (1, .7, .35), 2)
area("Fill", (-4, -2, 1), (math.radians(80), 0, math.radians(-60)), 80, (.6, .7, 1), 4)

# Caméra : push-in lent + légère orbite (animation keyframée, easing Bézier par défaut)
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 50
for f, dist, ang in [(1, 11.0, -8), (max(2, a.frames), 9.5, 8)]:
    x = dist * math.sin(math.radians(ang)); y = -dist * math.cos(math.radians(ang))
    cam.location = (x, y, 2.0); cam.rotation_euler = (math.radians(88), 0, math.radians(ang))
    cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)

sc.render.image_settings.file_format = "PNG"
sc.render.filepath = a.out.rstrip("/") + "/frame_"
bpy.ops.render.render(animation=True)
print("rendu OK →", a.out)
