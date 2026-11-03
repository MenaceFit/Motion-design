---
name: blender-3d
description: Produit des éléments 3D (bustes et mannequins dorés, objets-métaphores, caméras animées) en Blender headless via le module Python bpy, rendu Cycles CPU, puis intégration dans Remotion. À utiliser pour le style Golden Neuro ou tout plan 3D.
---

# Blender 3D headless (bpy)

## Prérequis
`pip install bpy==5.2.3` (Python 3.13, testé dans le conteneur : Blender 5.2.3 LTS).

## Procédure
1. Partir de `templates/blender/gold_bust_test.py` (fond noir pur, matériau or satiné
   metallic 1 / roughness 0,32, éclairage key + rim chaude + fill froid, AgX High Contrast,
   caméra keyframée push-in + orbite).
2. Modéliser par primitives/modifiers en code (ou importer un .glb/.fbx **sous licence
   commerciale** fourni par l'utilisateur).
3. Rendre en séquence PNG (fond noir ou `film_transparent = True` pour composer dans Remotion) :
   `python3 script.py out/ --frames 90 --samples 32 --res 1080x1920`
4. Intégrer : séquence → vidéo `ffmpeg -framerate 30 -i out/frame_%04d.png -c:v libx264 -crf 14 -pix_fmt yuv420p shot.mp4`
   puis `<OffthreadVideo src={staticFile('shot.mp4')} />` dans Remotion, texte par-dessus.

## Performances mesurées
540×960, 24 samples + denoise : ~6 s/frame sur 4 cœurs CPU. 1080×1920 ≈ ×4 → prévoir ~25 s/frame
(90 frames ≈ 40 min). Réduire samples (16) + denoise pour les tests.

## Erreurs fréquentes (vécues)
- `bpy.ops.object.shade_smooth()` n'agit que sur la sélection → facettes. Utiliser
  `for p in mesh.polygons: p.use_smooth = True`.
- Monde gris par défaut → mettre la force du nœud Background à 0 pour un noir pur.
- EEVEE nécessite un GPU/OpenGL : indisponible ici → Cycles CPU.

## Limites
Pas d'interface graphique ; modélisation organique complexe (visages, mains) peu réaliste en code →
privilégier formes stylisées (mannequins, bustes lisses) ou assets fournis.
