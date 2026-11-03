# Changelog — bibliothèque motion design

## 2026-11-03 — Mise en place initiale

### Environnement
- Inventaire des capacités réelles → `documentation/environment.md`.
- Installés et testés : OpenCV, PySceneDetect, librosa, faster-whisper (sans modèle), Remotion
  4.0.290, Blender 5.2.3 (bpy).
- Bloqués : huggingface.co, Demucs, GitHub downloads, Freesound, Pixabay, PyTorch.

### Références analysées (5)
- ref01 → nouveau style **Neon Explainer**
- ref02 → nouveau style **Golden Neuro**
- ref03 → nouveau style **Night Chat Story**
- ref04 + ref05 → nouveau style **Minimal Line** (même créateur, même langage)
- ADN commun du créneau documenté dans `references/index.md`.

### Outils créés (tous testés sauf mention)
- `tools/analyze_reference.py` — analyse automatique d'une référence.
- `tools/sfx_synth.py` — 13 SFX procéduraux originaux.
- `tools/qc_check.py` — QC format/noir/figé/loudness/synchro A/V.
- `tools/finish.sh` — loudnorm 2 passes + export plateforme.
- `tools/transcribe_words.py` — mode `--script` testé (limite : voix sèche uniquement ; sur ref04
  avec musique, mots placés ~0,3–0,5 s trop tôt) ; mode `--model` non testé (modèle inaccessible).
- `templates/remotion-kinetic` — compositions `KineticWords` et `LineStory` rendues et validées.
- `templates/blender/gold_bust_test.py` — rendu test validé.
- `templates/after-effects/*` — **non testés** (AE indisponible).

### Apprentissages (erreurs trouvées par le QC pendant les tests)
1. Scale d'entrée 0,35 → mot illisible 3 frames : passer à ≥ 0,7.
2. Bug d'échelle multipliée partant de 0 (drift) → vérifier toutes les valeurs initiales.
3. Mots longs qui débordent → auto-fit obligatoire.
4. Banding des dégradés sombres → grain animé en overlay.
5. Sortie Remotion en `yuvj420p` → forcer `yuv420p`.
6. True peak -0,8 dBTP après AAC → loudnorm à TP -1,5.
7. Blender : shade_smooth ne s'applique qu'à la sélection ; monde gris par défaut.

### Prochaines étapes proposées
- Bibliothèque de personnages SVG originaux (mascotte « pilule » propre, pictos Minimal Line).
- Composants de transition Remotion : light sweep, glitch, morph, palette shift.
- Composant HUD de série (inspiré du principe ref03, design original).
- Composant compteur + graphique (Minimal Line, ref05).
- Débloquer huggingface.co → tester la transcription mot à mot réelle.
- Première vidéo complète originale (script fourni ou proposé) dans le style choisi.

### Snippet — couleurs d'accent (k-means sur pixels saturés)
```python
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); m = (hsv[...,1] > 110) & (hsv[...,2] > 120)
_, l, c = cv2.kmeans(img[m].astype(np.float32), 4, None, (3, 20, 1), 3, cv2.KMEANS_PP_CENTERS)
```

## 2026-11-03 (2) — Texte 3D, prompt → vidéo, musique, viralité

### Installé
- npm : @remotion/three, three 0.171, @react-three/fiber 8, drei 9, postprocessing 6.37,
  @remotion/{transitions, motion-blur, noise, paths, shapes, layout-utils, media-utils},
  polices Anton, Archivo Black, Bebas Neue.
- pip : pedalboard (EQ/compression/reverb/limiteur), pyloudnorm, edge-tts/gTTS (inutilisables : hôtes bloqués).
- apt : libttspico-utils (voix fr hors ligne), espeak-ng, sox, fonts-noto-color-emoji.

### Créé
- `Text3D` / `Text3D30` (Remotion + Three.js) : texte extrudé biseauté, entrées flip/slam/twist,
  relais de sortie, caméra Perlin + impact sur accents, halo, particules, emojis, barre de progression.
- `tools/tts_voice.py`, `tools/music_gen.py`, `tools/mix_audio.py`, `tools/make_video.py`.
- Skill `prompt-to-video` ; `documentation/virality.md` (recherche sourcée, limites des données).

### Apprentissages (mesurés)
- Bloom = 7 s/frame sans GPU → halo additif ; SVG feTurbulence = 0,65 s/frame → tuiles PNG.
- Rendu WebGL logiciel : coût fixe ~0,7 s/frame même scène vide ; la résolution interne (dpr) ne
  change presque rien → le goulot n'est pas le remplissage de pixels.
- Concurrence 4 sur 4 CPU sature SwiftShader (≈3 s/frame effectif) — à comparer avec concurrence 1–2.
- Blocs de mots : coller les mots-outils (≤ 3 lettres) au mot suivant, couper sur la ponctuation,
  2 lignes au-delà de 8 caractères ; le dernier mot reste à l'écran.
- Monétisation : TikTok Creator Rewards ne paierait que les vidéos > 1 min (sources tierces) ;
  YouTube « contenu inauthentique » vise templates répétitifs et textes sans narration ;
  voix de synthèse → label IA TikTok.

## 2026-11-03 (3) — Vers le niveau pro : narration visuelle 3D

### Constat
Les 5 références racontent par l'image (une métaphore par idée : balance, serrure, montagne,
foule qui part, compteurs). La v1 « texte 3D seul » n'avait pas cette dimension.

### Créé
- `src/Scenes3D.tsx` : 24 objets-métaphores 3D originaux, personnages capsule + 6 actions, foule
  avec héros, graphique (4 tendances), compteur 3D, escalier, versus, emoji 3D.
- Moteur de scènes : une scène par phrase calée sur la voix, texte en bas quand une scène est
  présente, poussée caméra + light sweep (ref02) au changement, bascule chaude au climax (ref01),
  whoosh + pop sonores à chaque scène.
- `tools/compare_to_refs.py` + `references/refs_profile.json` : benchmark mesuré contre les refs.
- Composition `Gallery3D` (planche de contrôle de tous les objets).

### Profil mesuré des références (contenu seul, 30 fps)
Changements de plan 16–51/min ; plus longue image figée 0,2–2,1 s ; 0,9–2,3 événements visuels/s ;
mouvement moyen 0,6 (Minimal Line) à 9,5 (Golden Neuro).

### Erreurs corrigées (QC visuel)
- Lunette d'horloge sur le mauvais axe ; scènes trop petites (×1,3) ; « chute » de foule illisible
  (seul le héros tombe) ; texte 2 lignes aligné à gauche (lignes centrées une à une) ;
  chevauchement de sortie de scène trop long (0,25 → 0,12 s).
