---
name: short-form-production
description: Workflow de bout en bout pour produire une vidéo courte verticale originale (TikTok, Reels, Shorts) dans un style de référence — brief, script, DA, storyboard, plan d'animation, rendu Remotion/Blender, sound design, QC, export et checklist monétisation. À utiliser dès que l'utilisateur demande de créer/produire une vidéo.
---

# Production de vidéo courte (9:16)

Détail complet : `workflows/short-form-production.md`.
**Raccourci** : si l'utilisateur donne juste un sujet/prompt → skill `prompt-to-video`
(`tools/make_video.py`, texte 3D 60 fps). Ce workflow-ci sert aux projets sur mesure
(scènes illustrées, styles de référence, voix enregistrée). Résumé opérationnel :

## 1. Brief (une question à la fois si info manquante)
Objectif · plateforme · durée (25–60 s) · public · style de référence · voix off (fournie ?) ·
musique (licence ?) · CTA.

## 2. Script
- Hook ≤ 3 s (question ou affirmation contre-intuitive), une idée par phrase, punchline finale.
- 130–170 mots/min en français pour ce format. 40 s ≈ 100 mots.
- Marquer les mots-clés (accents) et 1 métaphore visuelle par phrase.

## 3. Direction artistique
Partir de la fiche `references/visual-styles/<style>.md` ; définir palette (hex), police (libre :
Google Fonts via @fontsource), personnages/pictos originaux, règle de rythme.

## 4. Storyboard (tableau)
`TC · durée · visuel · composition · animation (pattern Axx) · transition · texte · SFX`.

## 5. Production
- Voix : l'utilisateur enregistre (WAV 48 kHz, sans musique) → `tools/transcribe_words.py`.
- 2D : Remotion (`templates/remotion-kinetic`), une composition par vidéo, props JSON.
- 3D : Blender headless (`skill blender-3d`), rendu PNG → `<Img>`/`<OffthreadVideo>` dans Remotion.
- Sound : `skill sound-design`.

## 6. Rendu & finition
`npx remotion render … --crf=16` → `tools/finish.sh` → `tools/qc_check.py`.
Livrable : 1080×1920, 30 fps, H.264 High yuv420p, AAC 48 kHz, -14 LUFS.

## 7. Monétisation & conformité (sans garantie) — détails sourcés : `documentation/virality.md`
- Contenu original : script, voix, visuels, SFX créés pour le projet ; pas de reupload ni de
  « mash-up » de contenus tiers.
- Valeur ajoutée substantielle (information, analyse, narration) — éviter les séries produites en
  masse quasi identiques (risque « contenu répétitif / non original » des programmes de
  rémunération).
- Musique : uniquement sous licence compatible ; garder les preuves de licence.
- IA : si des visuels/voix réalistes sont générés par IA, appliquer l'étiquette de divulgation
  prévue par la plateforme.
- Pas de watermark d'une autre plateforme (pénalisé par la diffusion).
- Vérifier les règles à jour des programmes (TikTok Creator Rewards, YouTube Partner Program,
  Facebook/Instagram) au moment de publier : elles changent souvent.

## Checklist finale
- [ ] QC OK (format, loudness, synchro, pas de noir/figé involontaire)
- [ ] Texte lisible sur téléphone (test vignette 360 px de large)
- [ ] Zone sûre UI respectée
- [ ] Licences documentées
- [ ] Fichier projet + props + words.json archivés
