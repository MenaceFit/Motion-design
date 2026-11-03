---
name: quality-control
description: Contrôle qualité d'un export vidéo — format, FPS, pix_fmt, frames noires, images figées, loudness LUFS/true peak, silences, synchro audio-visuelle mesurée, lisibilité du texte et débordements. À utiliser avant toute livraison ou quand l'utilisateur demande de vérifier une vidéo.
---

# Contrôle qualité

## Procédure
1. **Automatique** :
   `python3 tools/qc_check.py final.mp4 --target 1080x1920 --fps 30 --lufs -14 --events words.json`
   Code retour 1 = échec bloquant (résolution, FPS, true peak). Avertissements = à justifier.
2. **Visuel** : extraire des images aux moments critiques (début de chaque mot +1 f, milieu de
   chaque transition, mot le plus long) en planche :
   `ffmpeg -i final.mp4 -vf "select='eq(n\,9)+eq(n\,24)',scale=360:-1,tile=4x1" -frames:v 1 qc.png`
   puis les lire. Chercher : débordement, texte illisible à l'entrée, banding, éléments coupés,
   collisions texte/illustration, zone UI.
3. **Rythme** : `tools/analyze_reference.py` sur notre propre export → comparer durée moyenne de
   plan et mouvement à la fiche de style visée.
4. **Corriger, re-rendre, re-QC.** Documenter les erreurs nouvelles dans la skill concernée.

## Seuils
| Contrôle | Seuil |
|---|---|
| Loudness intégrée | -14 LUFS ±1 (plateformes sociales) |
| True peak | ≤ -1 dBTP (viser -1,5 avant AAC) |
| Synchro A/V | médiane < 30 ms, max < 50 ms |
| Image figée | < 1,5 s (sauf intention) |
| Noir | aucun hors début/fin voulus |
| Format | 1080×1920, 30 fps, yuv420p, H.264, AAC 48 kHz |

## Erreurs détectées lors de la mise en place (exemples réels)
- Mot illisible les 3 premières frames (scale d'entrée trop basse) — trouvé par planche visuelle.
- Débordement des mots longs — trouvé par planche visuelle.
- Banding du dégradé radial — trouvé par planche visuelle, corrigé par grain.
- `yuvj420p` en sortie Remotion → `Config.setPixelFormat('yuv420p')`.
- True peak -0,8 dBTP après AAC — trouvé par qc_check, corrigé dans finish.sh.

## Limites
La synchro est mesurée par détection d'onsets : fiable pour des SFX percussifs, moins pour des
sons à attaque lente (riser, nappe).
