---
name: video-reference-analysis
description: Décompose une vidéo de référence (motion design, short-form) en plans, timecodes, palette, typographie, animations, transitions et sound design mesuré, puis met à jour la bibliothèque de styles. À utiliser dès que l'utilisateur envoie une vidéo, un GIF ou des captures comme référence ou demande « analyse », « décortique », « reproduis le style de ».
---

# Analyse de référence vidéo

**Objectif** : comprendre précisément *pourquoi* une référence fonctionne, avec des mesures, et le
transformer en principes réutilisables (pas en copie).

## Quand l'utiliser
Vidéo/capture de référence reçue ; demande de reproduire un style ; comparaison de styles.

## Prérequis
`ffmpeg`, Python : `opencv-python-headless scenedetect librosa soundfile matplotlib numpy`.

## Procédure
1. **Mesures automatiques** :
   `python3 tools/analyze_reference.py ref.mp4 <scratch>/an/refXX --step 0.5`
   → metadata (FPS, résolution, durée), coupes, mouvement/frame, palette k-means, onsets audio,
   tempo, silences, planche contact, timeline.png.
2. **Lire la planche contact** (`contact_sheet.jpg`) avec l'outil Read. Pour une vidéo verticale
   longue, réduire `--step` à 1.0 ou extraire des tuiles ciblées :
   `ffmpeg -i ref.mp4 -vf "select='eq(n\,90)+eq(n\,420)',scale=288:-1,tile=4x1" -frames:v 1 z.png`
3. **Zoomer** sur 2–4 images pleine résolution pour la typo, les contours, les ombres.
4. **Couleurs d'accent** : k-means sur pixels saturés (S>110, V>120) de quelques images (voir
   changelog pour le snippet). Ignorer les couleurs du watermark de la plateforme.
5. **Spectrogramme** des 12 premières secondes :
   `ffmpeg -t 12 -i ref.mp4 -lavfi showspectrumpic=s=1600x500:legend=1:fscale=log spec.png`
   Lecture : raies horizontales = musique tonale ; bande grave continue = drone ; traits verticaux
   large bande = transitoires (pops, clics, coupes) ; balayage montant = whoosh/riser.
6. **Découpage** : tableau TC début/fin · visuel · texte · animation · rôle narratif.
   Retirer la carte de fin plateforme (TikTok ≈ 3–4 s) des statistiques de rythme.
7. **Séparer** : réutilisable (principes) vs propriétaire (assets, personnages, textes, logos).
8. **Mettre à jour la bibliothèque** : fiche dans `references/visual-styles/` (créer seulement si
   style nouveau), `references/index.md`, catalogues de patterns, `changelog.md`.

## Erreurs fréquentes
- Prendre des transitoires de **voix** pour des SFX : la voix domine le mix ; formuler les SFX
  comme hypothèses tant qu'aucune séparation de sources n'est possible.
- Compter la carte de fin TikTok comme un plan (fausse la durée moyenne).
- ContentDetector rate les fondus lents → regarder la courbe de mouvement aussi.
- Planche contact à 0,5 s : rate les événements de 2–5 frames (glitch, flash). Extraire à pleine
  cadence sur la zone suspecte.

## Checklist
- [ ] Métadonnées (FPS, résolution, ratio, durée contenu vs totale)
- [ ] Palette mesurée (hex) + couleurs d'accent
- [ ] Typo (famille proche, graisse, casse, taille relative, couleur, effets)
- [ ] Rythme : plans/min, durée moyenne, cadence du texte
- [ ] Animations principales avec easing estimé
- [ ] Sound design : musique, SFX probables, loudness, tempo
- [ ] Structure narrative (hook, développement, punchline, CTA)
- [ ] Réutilisable vs à remplacer
- [ ] Bibliothèque mise à jour + changelog

## Limites connues
- Pas d'écoute réelle : l'audio est mesuré (spectre, onsets, loudness).
- Séparation voix/musique/SFX (Demucs) impossible tant que les poids du modèle ne sont pas
  téléchargeables (hôte bloqué par la politique réseau du conteneur).
- Tailles/épaisseurs estimées ±10 % sur sources 576p.
