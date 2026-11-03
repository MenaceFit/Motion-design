---
name: kinetic-typography
description: Anime du texte synchronisé à une voix off — style « 1 mot géant » (pop, split bicolore) ou « sous-titre révélé mot à mot » — avec Remotion, à partir d'un words.json. À utiliser pour titres animés, sous-titres dynamiques, mots-clés, vidéos face-cam ou explainers TikTok/Reels/Shorts.
---

# Kinetic typography synchronisée à la voix

**Objectif** : chaque mot apparaît exactement quand il est prononcé, avec une animation lisible
sur mobile et un rythme short-form.

## Prérequis
- `templates/remotion-kinetic` installé (`npm install`), `CHROMIUM_PATH` vers le headless shell.
- Un `words.json` : `[{"text","start","end","accent"}]` (secondes).

## Procédure
1. **Timings** :
   - Avec modèle : `python3 tools/transcribe_words.py voix.wav words.json --model small --lang fr --upper`
   - Sans modèle (voix SÈCHE uniquement) : `--script texte.txt` (±120 ms, à retoucher).
2. **Marquer les accents** (`"accent": true`) : 1 mot sur 4–6 max — chiffres, négations, mot
   savant, punchline. Trop d'accents = plus aucun accent.
3. **Choisir le mode** :
   - `KineticWords` : 1 mot centré, pop spring, split bicolore, contour + ombre dure (Neon Explainer).
   - `LineStory` (sous-titres) : phrase à mise en page fixe, mots révélés à leur `start` (Minimal Line).
4. **Rendre** :
   `npx remotion render src/index.ts KineticWords out.mp4 --props=props.json --crf=16`
5. **Contrôler** : extraire 4–6 images au début de mots (frame start+1, +3) → vérifier taille,
   débordement, lisibilité. Puis `tools/finish.sh` et `tools/qc_check.py --events words.json`.

## Mode 3D (`Text3D`, Three.js) — par défaut pour les vidéos virales
- Texte **réellement extrudé** (profondeur 0,55 em, biseau), 2 matériaux (face claire / flancs
  colorés), pose de repos inclinée alternée G/D pour toujours voir le volume.
- Entrées `flip` / `slam` / `twist` (spring), sortie vers la caméra en relais pendant l'entrée du
  mot suivant (chevauchement 0,1 s → aucune frame vide).
- Caméra continue (bruit de Perlin) + **impact amorti** sur les mots accentués (`shake`).
- Halo additif derrière le mot, particules en profondeur, grain, emoji pop, barre de progression.
- Blocs multi-mots > 8 caractères → 2 lignes automatiques.
- 60 fps (`Text3D`) ou 30 fps aperçu (`Text3D30`). Polices 3D : `src/fonts3d/*.json`
  (conversion : `node scripts/font_to_typeface.mjs police.woff sortie.json`).

## Qualité « pro » (v3) — appliquée par défaut
- **Mode `keywords`** (défaut avec voix) : seuls les mots-clés (`accents`) passent en 3D géant ;
  la phrase complète est en **sous-titres karaoké** (`Captions.tsx`) : pages ≤ 6 mots / 26 car.,
  Montserrat 800 majuscules 60 px, contour 11 px + ombre dure, mot prononcé en couleur d'accent
  (vert-jaune `#d7ff3a` façon ref03) avec pop, mots à venir atténués 42 %. Placés à 24,5 % du bas
  (au-dessus de l'interface TikTok/Reels). `text_mode: "words"` = ancien mode, 3D seul.
- **Split bicolore** des mots-clés (ref01) si le thème définit `accent2Face` (neon : rouge/bleu).
- **Rendu studio** : environnement procédural `RoomEnvironment` → PMREM (reflets réels, aucun
  HDRI à télécharger), face vernie (clearcoat) avec dégradé vertical (vertex colors), flancs
  métallisés, rim light arrière, courbes 12 segments, biseau 4 segments, ombre douce sous les objets.
- **Lisibilité à l'entrée** : ressort raide (stiffness 240, damping 16), angle d'entrée réduit
  (−0,95 rad) → mot lisible en ~4 frames.
- **Timings** : poids de chaque mot = durée du mot synthétisé seul (plus précis que les syllabes).
- Mise en page avec scène : objet en haut (~25 %), mot-clé 3D au centre-bas, sous-titres en bas.

## Règles de design
- Zone sûre 9:16 : garder le texte entre 15 % et 75 % de la hauteur (UI TikTok en bas/droite).
- Taille : mot unique ≈ 70–78 % de la largeur max ; auto-fit selon la longueur (déjà codé).
- Contraste : contour sombre 5 % de la taille de police + ombre portée dure 6 %.
- Mot visible au minimum 4 frames ; regrouper les mots < 0,12 s (« de », « la ») avec le suivant.
- Accent couleur réservé aux mots-clés ; le reste en blanc cassé `#f4ecff`.

## Exemple (props.json)
```json
{"words":[{"text":"TON","start":0.2,"end":0.55},{"text":"CERVEAU","start":0.55,"end":1.1,"accent":true}],
 "palette":{"bgInner":"#4a1846","bgOuter":"#14061a","colorA":"#ff3d5a","colorB":"#3d8bff","stroke":"#1a0820"},
 "autoSfx":true,"voice":"voice.wav"}
```
(fichiers audio dans `public/`).

## Erreurs fréquentes (vécues lors des tests)
- 3D vue de face = extrusion invisible → toujours une pose de repos inclinée (rotY ±0,3, rotX 0,16).
- Bloom (postprocessing) = 7 s/frame sans GPU → halo additif (plan + texture radiale) quasi gratuit.
- Filtre SVG feTurbulence (grain) = 0,65 s/frame → tuiles PNG pré-calculées.
- `noise2D` sur des coordonnées entières vaut 0 → particules alignées ; utiliser `random(seed)`.
- Le dernier mot ne doit pas sortir (écran vide final) → tenu jusqu'à la fin.
- Scale d'entrée trop basse (0,35) → mot illisible pendant les 3 premières frames. Utiliser ≥ 0,7.
- Multiplier deux échelles dont l'une part de 0 (bug « drift » corrigé) → toujours vérifier les
  valeurs initiales de chaque interpolate.
- Taille fixe → les mots longs débordent. Toujours auto-fit.
- Dégradés sombres → banding après H.264 : grain animé en overlay (composant `Grain`).

## Checklist
- [ ] Aucun mot ne déborde (tester le mot le plus long)
- [ ] Lisible dès la 2e frame du mot
- [ ] Accents ≤ 20 % des mots
- [ ] Décalage audio/texte médian < 50 ms (QC)
- [ ] Zone sûre respectée

## Limites
- Rendu 3D sans GPU : ~1,3–3 s/frame selon la charge (25 s à 60 fps ≈ 30–75 min). Avec GPU local : 10–20× plus rapide.
- L'auto-fit est une estimation (0,74 em/glyphe pour Montserrat 900 italic) : à recalibrer si on
  change de police.
- Transcription automatique indisponible tant que huggingface.co est bloqué (mode `--script` sinon).
