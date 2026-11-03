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
- L'auto-fit est une estimation (0,74 em/glyphe pour Montserrat 900 italic) : à recalibrer si on
  change de police.
- Transcription automatique indisponible tant que huggingface.co est bloqué (mode `--script` sinon).
