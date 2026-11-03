---
name: sound-design
description: Construit la timeline sonore d'une vidéo motion design — SFX synthétisés originaux (pop, whoosh, sub hit, riser, tick, glitch, shimmer…), placement synchronisé aux animations, mix voix/musique/SFX et loudness -14 LUFS. À utiliser pour sonoriser une vidéo, générer des SFX libres de droits ou corriger une synchro audio.
---

# Sound design & SFX

**Objectif** : chaque son renforce un mouvement ou un mot ; mix propre, voix intelligible,
loudness conforme aux plateformes, zéro problème de droits.

## Prérequis
`numpy soundfile` (synthèse), `ffmpeg`, `librosa` (vérification).

## Procédure
1. **Générer la banque** (originale, libre de droits) :
   `python3 tools/sfx_synth.py public/sfx --variants 3 [--seed N]`
   Changer `--seed` pour obtenir de nouvelles variantes propres à chaque projet.
2. **Timeline SFX** : à partir du storyboard / words.json, appliquer le tableau
   `references/sound-patterns/catalog.md` (événement → son, volume, offset).
   Dans Remotion : `autoSfx: true` (pop par mot, sub_hit sur accents) + liste `sfx` manuelle
   pour whooshes/risers.
3. **Musique** : uniquement une piste dont la licence autorise l'usage commercial sur la plateforme
   (bibliothèque audio de la plateforme, musique composée, ou licence achetée). La placer à
   -20/-24 dB sous la voix.
4. **Mix** : voix prioritaire ; SFX discrets (on doit les sentir plus que les entendre).
5. **Finition** : `tools/finish.sh` (loudnorm 2 passes, -14 LUFS, TP -1,5 dBTP).
6. **Vérifier** : `python3 tools/qc_check.py final.mp4 --events words.json` → décalage médian < 50 ms.

## Spécification d'une ligne de timeline
`type · timecode · durée · intensité relative · rôle · point de synchro`
ex. `whoosh_in_02 · 00:07.53 · 0,55 s · 0,5 · transition chapitre 2 · pic sur frame 232 (light sweep)`

## Erreurs fréquentes
- True peak > -1 dBTP après AAC (constaté au test : -0,8) → viser -1,5 en sortie de loudnorm.
- Le même pop sur 40 mots → alterner les variantes, baisser le volume.
- Mesure LUFS intégrée sur un son < 400 ms = non significative (gating EBU R128).
- Mode `--script` de transcription faussé si la piste contient de la musique.

## Checklist
- [ ] Chaque SFX a un rôle
- [ ] Voix intelligible partout
- [ ] -14 LUFS ±1, TP ≤ -1 dBTP
- [ ] Licences de musique documentées dans le dossier projet

## Limites
- Banques en ligne (Freesound, Pixabay) et modèles audio génératifs non joignables depuis ce
  conteneur → synthèse procédurale. Les sons synthétiques sont plus « propres/UI » que des
  enregistrements foley ; pour des textures organiques, fournir des sons sous licence.
- Pas de TTS : la voix off est fournie par l'utilisateur (meilleur aussi pour l'originalité).
