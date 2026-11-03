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
