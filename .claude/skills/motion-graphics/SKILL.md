---
name: motion-graphics
description: Crée des scènes de motion graphics 2D (pictogrammes, line art, icônes-métaphores, compteurs, graphiques, HUD, personnages flat) animées en Remotion/SVG. À utiliser pour illustrer une idée par une métaphore visuelle dans un explainer ou une vidéo courte.
---

# Motion graphics 2D (Remotion + SVG)

**Objectif** : traduire chaque idée du script en une métaphore visuelle animée, simple et lisible
en < 2 s.

## Prérequis
`templates/remotion-kinetic`, fiches `references/visual-styles/*`, catalogue
`references/animation-patterns/catalog.md`.

## Procédure
1. **Script → métaphores** : pour chaque phrase, 1 objet/scène qui la résume (ex. patience →
   sablier ; entourage toxique → personnes qui tirent vers le bas ; curiosité → serrure).
   Préférer des symboles universels et des objets que l'on dessine soi-même.
2. **Choisir la grammaire** du style (fiche) : flat coloré (Neon Explainer, Night Chat) ou line art
   blanc (Minimal Line) ou 3D doré (Golden Neuro → skill blender-3d).
3. **Dessiner en SVG paramétrique** (composants React) : formes simples, épaisseur de trait
   constante (4 px à 1080p pour Minimal Line), coins arrondis cohérents.
4. **Animer** avec les patterns du catalogue : stroke draw (A4), icon pop (A5), counter roll (A6),
   stagger (A10), step walk (A14). Une action principale à la fois.
5. **Vie de fond** : boucles lentes (particules, glow pulse, grille) pour éviter l'image figée.
6. **Composer** en 9:16 : sujet dans le tiers central, texte dans sa zone, marges 6 %.
7. **Rendre une image fixe par scène** d'abord (`npx remotion still`), valider, puis la vidéo.

## Techniques Remotion clés
- `interpolate(frame,[a,b],[x,y],{easing: Easing.bezier(.16,1,.3,1), extrapolateLeft:'clamp', extrapolateRight:'clamp'})`
- `spring({frame, fps, config:{damping, stiffness, mass}})` pour les overshoots.
- `strokeDasharray={L} strokeDashoffset={interpolate(...)}` pour le tracé.
- `random('seed')` (déterministe) pour particules et foules — jamais `Math.random()`.
- `<Sequence from durationInFrames>` pour découper les scènes.

## Erreurs fréquentes
- Trop d'éléments animés simultanément → l'œil ne sait pas où regarder.
- `Math.random()` → rendu non déterministe (scintillement entre frames rendues en parallèle).
- Reprendre un personnage/icône identique à une référence : redessiner avec d'autres proportions.

## Checklist
- [ ] Chaque scène se comprend sans le son (test : image fixe au milieu du plan)
- [ ] Une action principale à la fois
- [ ] Rien de figé > 1,5 s (QC freezedetect)
- [ ] Assets 100 % originaux

## Limites
- Pas encore de bibliothèque de personnages articulés (à construire — voir changelog).
- Pas d'accès Figma/Illustrator dans ce conteneur : tout est dessiné en SVG code.
