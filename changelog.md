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

## 2026-11-03 (4) — Qualité de rendu et précision des textes (v3)

### Recherche (sources dans la réponse à l'utilisateur)
- Sous-titres mot à mot surlignés = style le plus utilisé en short-form (sources vendeurs, consensus) ;
  gras 700+, contour/ombre, 3–7 mots par ligne, hors zone d'interface basse.
- Retenue : mettre en avant les mots-clés au bon moment plutôt que tout animer.
- Étude 2024 (symposium GRID) : l'interpolation des keyframes influe sur la lisibilité.
- RoomEnvironment + PMREMGenerator (doc three.js) : éclairage par image sans HDRI externe.

### Appliqué
- Mode `keywords` + `Captions.tsx` (karaoké), split bicolore ref01, rendu studio (PMREM,
  clearcoat, dégradé de face, rim light, ombres de contact), entrée plus lisible, timings par
  durée réelle des mots, mise en page à 3 étages (objet / mot-clé / sous-titres).

### Erreurs corrigées (QC visuel)
- Espaces entre mots des sous-titres « mangés » par le contour épais → marge 17 px.
- Mot-clé 3D collé aux sous-titres → remonté ; personnage qui tombe sur son voisin → chute vers la caméra.

## 2026-11-03 (5) — Intégration des librairies d'animation et des banques SFX (v4)

- Évaluation de ~60 librairies/sources fournies par l'utilisateur → `documentation/libraries.md`
  (critère : déterminisme image par image + licence commerciale).
- Intégré : **GSAP** (courbes d'easing : cascade de lettres 3D, éclats, pop des sous-titres),
  **cannon-es** (scène `physics` : pièces/blocs/balles avec vraie gravité, simulation précalculée),
  **Lottie** (@remotion/lottie + animation originale `check.json`), **uisfx** (CC0), **jsfxr**,
  **ZzFX** → bibliothèque de 344 SFX + son sémantique par scène.
- Installé, en réserve : Anime.js, Matter.js, Zdog. Bloqués par le réseau : toutes les banques
  sonores web, LottieFiles, remotion.media.
- QC visuel v4 : icônes blanches en thème gold (→ `iconColor`), haut des objets coupé (→ y 1,6,
  échelle 1,15), graphique trop haut (→ ×1,8), dernière barre blanche.

## 2026-11-04 — Nouveau genre : glow-up interactif (projet principal de l'utilisateur)
- Analyse de ref06/07/08 (2 comptes, même formule) → `references/visual-styles/interactive-glow-up.md` :
  compte à rebours + jauge, vote en commentaire, récap « vous avez choisi », SMS, mission en 3 temps,
  > 60 s, SFX très denses (~4,5/s), 2D flat à contours épais.
- Projet `projects/teddy-j30/` : bible de série et DA (`BIBLE.md`), script de l'épisode 1
  (`ep01-J30-script.md`), fiche personnage (`design/character-sheet.png`, SVG original).
- Choix clé : on transforme les habitudes et le style de Teddy, pas son corps (marque, monétisation, ton).
- Prochaine brique technique : rig 2D SVG de Teddy dans Remotion (expressions, tenues par niveau,
  mèche antenne), décors, HUD, carte de vote, téléphone.

## 2026-11-04 (2) — Teddy : rig 2D + 15 premières secondes de l'épisode 1
- Mesure image par image des sous-titres des refs (pop 0,45 → 1,15 → 1,0 en ~6 frames, 1–2 mots,
  pas de sortie) → `PunchCaptions` + regroupement français (mots-outils, mots-clés, expressions).
- Rig 2D SVG de Teddy (8 expressions, poses, squash & stretch, mèche à ressort, niveaux 1/5),
  décor Grotte, HUD slam, annotations, faire-part 3D CSS, badge Diamant → Carton qui se brise.
- `tools/teddy_build.py` : épisode JSON → voix calée, sous-titres, musique (drop sur le HUD), SFX, mix.
- Rendu `teddy-ep01-part1` : 15,2 s, 60 fps, -14,0 LUFS, synchro médiane 13 ms. Skill `teddy-series`.
- Typographie des sous-titres de la série passée en Anton (plus proche du genre, demande utilisateur).

## 2026-11-04 (3) — Teddy épisode 1 complet (59 s)
- 24 répliques, 3 voix (pitch/speed par ligne), sous-titres avec frontières de ponctuation.
- Décor beaucoup plus sale + gags (sweat autonome, mouches masquées, chat avec valise, chute
  « crêpe », pizza sur le visage), SMS tape/efface/pouce/vu, story du rival, vocal de Mamie Jo,
  checklist, vote DOUCHE ✕ CHAMBRE.
- QC : 59,2 s, 60 fps, -13,9 LUFS, synchro médiane 1 ms. Fichier de publication `ep01/PUBLICATION.md`.
- Erreur corrigée : chute à plat → personnage hors cadre ; remplacée par un écrasement cartoon.

## 2026-11-04 (4) — Épisode 2 « La douche » + moteur ElevenLabs
- `tools/tts_voice.py` : moteur ElevenLabs (voix par personnage, horodatage par caractère, prosodie
  enchaînée), repli automatique hors ligne + `voice_report.json` ; `tools/elevenlabs_voices.py`.
- ElevenLabs non joignable dans cette session (domaine bloqué, pas de clé) → ép. 2 rendu en repli Pico.
- Nouveaux éléments : salle de bain, rideau, douche-placard, eau, Teddy gelé/serviette/propre, mousse,
  couloir, Bzz en vacances, Croquette qui applaudit, éphéméride qui se tourne, jauge animée,
  vote et téléphone paramétrables.
- QC visuel : flacon hors cadre au zoom, rideau qui masquait les yeux → corrigés avant rendu.

## 2026-11-04 — Ép. 1 : voix ElevenLabs de l'utilisateur
- Prise unique de 51 s (voix Liam, eleven_v4) découpée en 24 répliques : silences mesurés (ffmpeg silencedetect),
  points de coupe vérifiés par transcription Whisper base (sherpa-onnx, modèle téléchargé depuis GitHub, HF bloqué).
- Pipeline : `<dossier épisode>/voice/<id>.(wav|flac|mp3)` = prise fournie, utilisée en priorité par `teddy_build.py`
  (moteur « file » de `tts_voice.py`). Mots placés sur la zone voisée au prorata des syllabes (±120 ms).
- Connecteur ElevenLabs : génération possible mais « free generations busy » aux heures chargées ; l'audio généré n'est
  pas téléchargeable depuis le conteneur (api.us.elevenlabs.io, elevenlabsusercontent.com bloqués) → passer par un fichier.

## 2026-11-20 — Créneau « GTA 6 astuces / codes » : analyse, sourcing réel, montage automatisé
- **5 nouvelles références** (ref09–ref13 : @mielpops.67, @gta6alerte_, @adrgta ×3) mesurées : plan
  médian 1,3–1,8 s, ~2,4 sous-titres/s à 77 % de la hauteur, loudness médiane -14,6 LUFS, intro
  zoom-blur 6 frames, compteur $ ease-out, cartes UI vitrées, CTA S'abonner animé.
  → fiche `references/visual-styles/gta-guide.md`, patterns A17–A24, sons GTA.
- `analyze_reference.py` : `librosa.beat.beat_track` segfault (numba) sur 2 fichiers → tempo par
  autocorrélation NumPy.
- **Réseau** : session basculée sur l'environnement « Motion-design » ; ajout de `www.rockstargames.com`
  et `media-rockstargames-com.akamaized.net` (téléchargements officiels GTA VI).
- `tools/gta_source.py` : catalogue + téléchargement des médias officiels (trailers 1, 2, Launch,
  Out Now en 4K, 155 captures, clips du site) avec `footage/provenance.json` (URL, sha256, droits).
- `tools/footage_index.py` : proxies, 245 plans détectés, cadrage 9:16 (YuNet + saillance spectrale),
  planches numérotées (triptyque début|milieu|fin pour les plans > 3,5 s), recherche par tags.
  308 entrées taguées à la vision → `references/gta-footage-tags.json` (versionné). Erreur corrigée :
  `LT-054` et `T1-006` contenaient des fondus vers des cartons/logos (champ `range`, `avoid`).
- `tools/clip_cut.py` : recadrage 9:16 depuis la 4K (sans upscale), étalonnage léger, transitions
  **zoom-blur** et **whip** cuites (whip refait : le bord miroir était visible), Ken Burns des captures.
- Remotion `GtaGuide` (+ `Icons.tsx`) : sous-titres condensés italiques 1 ligne, punch, flash, shake,
  overlays counter / combo / code / card / step / alert / title / pin / flow / subscribe.
- `tools/gta_build.py` : plan.json → voix Piper (fr_FR-siwis, CC-BY 4.0) ligne par ligne → Whisper
  `small` (timings) → sous-titres (ponctuation FR, petits mots, mots-clés) → plans → clips → SFX
  fonctionnels → musique → mix → rendu → finish → QC. `transcribe_words.py` : contournement
  faster-whisper/PyAV (audio décodé avant).
- **Démo** `projects/gta6-code-argent` : code 250 000 $ (faits recoupés sur Red Bull, North Jersey/
  GameSpot, The Loadout). 34,6 s, rendu ~6 min (4 CPU). QC OK : 1080×1920, 30 fps, -14,0 LUFS, synchro médiane -22 ms ; écarts de synchro
  en début de ligne = whoosh placé 0,14 s avant la transition (voulu) ; sous-titres avancés d'1 frame.
- Skills : `gta-footage-sourcing`, `gta-guide-video`.

## 2026-11-20 (2) — GTA Guide v2 : 60 i/s, transitions variées, sound design pro, voix ElevenLabs
- `tools/sfx_pro.py` : 24 SFX stéréo originaux (whooshs directionnels G→D / D→G vérifiés par énergie
  par canal, whoosh long, aspiration, whips, boom sub, hit, ka-ching, pièces, glitch, riser, notes de
  touches do-ré-mi…, success, tick). Spectrogrammes vérifiés ; souffle grave des whooshs réduit pour
  ne pas masquer la voix.
- `clip_cut.py` v2 : sortie 60 i/s (remappage temporel), speed ramps ×3 avant/après transition avec
  mélange d'images (flou de bougé), nouvelles transitions spin, whip vertical, glitch RVB. Piège
  observé : la rampe consomme plus de source et peut déborder sur le plan suivant → `source_span()`
  et rampe retirée si le plan est trop court.
- `GtaGuide` v2 : base de temps indépendante du fps (`useT`, spring à frames fractionnaires), light
  leaks additifs, grain animé, sous-titres élastiques + « slam » des mots-clés, rayons + explosion de
  « $ » au compteur, ondes sur les touches, barre de progression des étapes, fps via calculateMetadata.
- `gta_build.py` v2 : table des transitions (image + son + light leak), automation musicale (`cut` =
  tape-stop + silence + boom au retour, `drop` = riser + boom), SFX en couches par overlay, et **mode
  `--voice-file`** (prise unique ElevenLabs → Whisper → nombres en lettres via num2words → alignement
  difflib caractère à caractère : 96 % de caractères communs, bornes à ±50 ms sur une prise test).
- Script ElevenLabs : `projects/gta6-code-argent/SCRIPT_ELEVENLABS.md` (11 lignes, ~36 s, faits recoupés).
- Rendu v2 (voix Piper provisoire) : 36,2 s, 1080×1920, 60 i/s, -14,0 LUFS, synchro médiane -16 ms, QC OK ;
  ~15 min de build (2170 frames).

## 2026-11-21 — v3 : voix ElevenLabs de l'utilisateur, accroche et CTA, +346 plans officiels
- Voix : prise ElevenLabs v4 (voix Hugo, 40 s) calée par `--voice-file` : 96 % de caractères communs avec
  le script (balises d'émotion ignorées). Copie versionnée : `projects/gta6-code-argent/voice_elevenlabs.mp3`.
- Footage : « An Extended Look » (officiel, 14,1 Go, 26 min 48 s) téléchargé et indexé : 346 plans,
  tous tagués à la vision (54 marqués `avoid` : noirs, cartons, labo de drogue, sang). Plus de 40 plans
  de vrai gameplay avec HUD. Bibliothèque : 792 entrées, 654 taguées. Zip vidéo officiel vérifié à
  distance (répertoire central lu par requêtes Range) : aucun contenu nouveau.
- Liens YouTube fournis (BenedictPlays, GameV) : vidéos d'autres créateurs, non téléchargées (hôtes
  vidéo YouTube refusés par le proxy, et pas d'aspiration de contenus tiers sans accord). `gta_source.py
  ingest` exige désormais `--rights own|permission|official` et peut indexer aussitôt (`--index`).
- Nouveaux overlays `hooktag` et `follow` (CTA), coupes flash dans l'accroche, caméra à l'épaule,
  13 nouveaux SFX (scratch, cymbale inversée, cloche, déclencheur, sub-drop, variantes) en rotation.
