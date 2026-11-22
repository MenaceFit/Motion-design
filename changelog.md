# Changelog — bibliothèque motion design

## 2026-11-22 (3) — Promo du groupe (GroupPromo) : montage de tout le contenu existant
- Mur de 10 legit checks (cartes qui tombent sur les noms de modèles, tampons LEGIT / 1:1 alternés), compteur « 10+ MODÈLES »,
  implosion des cartes puis explosion lumineuse, ticket 245 € → 900 €+, Alo 300 € → 90 €, carte groupe 🔒→🔓 + checklist,
  « résultats variables », « comment éviter le faux », CTA bio + notif DM. Exclus : sources non vérifiées. 105 SFX. QC OK.
- Note : sur les planches de contrôle réduites, la trame de fond peut ressembler à des rayons → vérifier en pleine taille.

## 2026-11-22 (2) — Veste UA hybrid blanche (howto, sans prix)
- Fin sans prix : `outro.moi = benefAt = plugAt` saute le bloc prix ; nouveaux champs `outro.plugWord` (« UNE QUESTION ? »),
  `outro.cta` / `ctaSub` (« 📌 ENREGISTRE — POUR TON PROCHAIN ACHAT ») pour coller à la voix. 62 SFX. QC OK.
- Refusé : vidéo « personal shoppers » (lot Nike/UA à 30–40 € via appli de revendeur chinois, revente prix authentique)
  sans preuve d'authenticité (codes produit) — même sans le mot « authentique ».

## 2026-11-22 — Contact ensembles (Alo / Essentials) + voix provisoire open source
- ElevenLabs inaccessible (quota puis « free generations busy ») ; hôtes ElevenLabs bloqués depuis le conteneur
  (impossible de rapatrier un audio généré via le connecteur). Refus de cloner la voix « Kevin » (voix pro sous licence).
- Voix provisoire : Chatterbox multilingue (MIT, watermark Perth) voix par défaut, FR. Le modèle « déraille » parfois
  (charabia en fin de phrase) → `projects/contact-sets/gen_takes.py` (3 prises/phrase) + `pick.py` (Whisper : meilleure
  prise, coupe après le dernier mot attendu, assemblage avec pauses). torch via PyPI ok ; perth exige setuptools<81.
- Composition `SetsPromo` (prix barré + tampon 90 €, −70 %, Vinted ~135 €, LEGIT, carte contact verrouillée → 🔓, notif DM).
  Timings dans `setsTimings.ts` (à remplacer si voix Kevin). 55 SFX. QC OK.

## 2026-11-21 — « 245 € → 900 € » trouvailles semi-luxe (nouvelle composition LuxeFinds)
- Hook chiffré dès 0 s (3 cartes qui tombent, ticket de caisse qui s'imprime, compteur 900 €+), preuve « pas du 1.1 »
  (tampons LEGIT), 1 transition d'entrée différente par article (glisse+rotation / zoom+spin / chute rebond), étiquettes
  de prix suspendues qui se balancent, bénéfice calculé, récap +655 € + « résultats variables », CTA groupe privé.
- Notifications du groupe = uniquement les 3 vraies trouvailles (pas de faux bons plans inventés). 121 SFX doux. QC OK.

## 2026-11-20 (2) — Phenom Elite gris (howto, 3 étapes)
- Slideshow utilisateur (flèches conservées). Pastilles couleur retirées : la mesure sur photos d'éclairage différent
  contredisait le message (le 1:1 mesurait plus foncé) → ne pas afficher d'hex quand les photos ne sont pas comparables.
- Voix : « 28 € → 80 € … 50 € de bénéfice » ; affiché +52 € (calcul exact). 80 SFX. QC OK.

## 2026-11-20 — Phenom Elite Tokyo (howto, 4 étapes) + récap final
- Images tirées du slideshow TikTok de l'utilisateur (zones photo seules, sans légendes ni filigrane).
- Howto : nouveau bloc de fin « MAINTENANT TU SAIS » = récap coché des étapes (incite à enregistrer) + « ABONNE-TOI »
  + « ENREGISTRE POUR PLUS TARD », avant les prix. Son doux (soft_sfx). 30 € → 150 € → +120 €. QC OK.

## 2026-11-17 — Bas Nike Trail + son adouci
- Retour utilisateur : compte à rebours « trop agressif ». Nouveau `tools/soft_sfx.py` (SFX synthétisés doux) :
  tons marimba (ré5, puis la5 sur le « 1 ») + battement de cœur grave à la place des blips 8-bit et du tic-tac ;
  révélation en cloche douce (accord majeur) au lieu de power-up + hitHurt ; buzzers, impacts et riser baissés,
  laser du balayage remplacé par un swoosh ; musique −18 dB. → à réutiliser par défaut.
- Trail : authentique à gauche, fond étoilé ; matière, logo Nike Trail, écriture intérieure ; 15 € → 110 € → +95 €. QC OK.

## 2026-11-16 (3) — Bas Nike AeroSwift + thèmes de DA
- Testé une DA « street mag » (`theme: 'mag'`) : refusée par l'utilisateur → conservée dans le code mais non utilisée.
- Retenu : DA pixel d'origine + fond « bleu minuit étoilé » (`theme: 'night'` : dégradé nuit, 140 étoiles scintillantes,
  étoiles pixel en croix, voie lactée, étoiles filantes). Rendu ~30 % plus lent (nombreux éléments).
- Leçon voix : des repères en MAJUSCULES dans le script sont lus tels quels par ElevenLabs → toujours écrire les prix.
- AeroSwift : logo (penché / droit), écriture intérieure (blanche / grisée), matière hybride ; 25 € → 90 € → +65 €. QC OK.

## 2026-11-16 (2) — Gilet Therma-FIT ADV menthe
- Vrai = images 1-3, 1:1 = images 4-5 (hypothèse signalée à l'utilisateur, confirmée par les indices visibles).
  Étape 3 choisie après zoom : « THERMA-FIT » réfléchissant fin (vrai) vs « THERMA-FIT ADV » noir épais (1:1).
- Sources basse définition (~250 px) → cartes plus douces. 105 SFX ; 22 € → 80 € → +58 €. QC OK.

## 2026-11-16 — Gilet Therma-FIT ADV (authentique à gauche)
- Option `realLeft` : positions des cartes par rôle (`XS()`), teintes, tampons, « GAUCHE ! », gestes du perso
  (`toReal()` / `toFake()`) et surbrillance du compte à rebours suivent le côté de l'authentique.
- Étapes : bulles (gonflées / plates), sifflet + cordon (présents / absents), écriture intérieure (fine / épaisse qui bave).
- 104 SFX ; 15 € → 80 € → +65 €. QC OK.

## 2026-11-14 (6) — Format « comment différencier » (mode howto)
- `mode: 'howto'` : intro « COMMENT DIFFÉRENCIER » + nom du produit, cartes étiquetées 1:1 / AUTHENTIQUE d'emblée,
  pastille VS, tampons ; chips « ÉTAPE n/N » ; HUD dès la 1re étape ; pas de « t'en avais combien » (bloc sauté en
  posant alors = combien = écris = moi).
- Leçon : en howto, finir la dernière section *avant* « moi » (quizEnd ≈ moi − 0,3 s), sinon titres et cartes se chevauchent.
- Under Armour hybrid howto : 34,1 s, 85 SFX, QC OK.

## 2026-11-14 (5) — Vidéo bas Under Armour hybrid
- 1:1 = photos d'annonce fournies (filigrane exclu du cadrage), vrai = photos utilisateur. Les captures « différences »
  d'un autre créateur servent seulement à apprendre les critères, jamais affichées.
- Étapes : matière hybride (deux noirs), logo (réfléchissant / gris mat), dos (mollets brillants / uniforme).
  Le critère « écriture brillante de la ceinture » n'est pas montré : pas de photo de la ceinture du 1:1.
- 105 SFX ; effets v2+v3+v4. QC OK.

## 2026-11-14 (4) — Vidéo Zip Running Division vert (effets v4)
- `fx3` : anneau de compte à rebours (jaune → rouge sur le 1), pastilles couleur avec hex mesuré sur les photos
  (`swatches`, moyenne de pixels : 1:1 #91A69A, vrai #94D2C5), badge « MODÈLE RARE » (`outro.rareAt`), tampons placés
  par carte (`stampY: [faux, vrai]`).
- 1:1 = photo fournie par l'utilisateur, vrai = vidéo utilisateur. Script adapté à ce qu'on voit (1:1 terne/grisâtre,
  pas « plus foncé ») pour éviter une incohérence image/voix.
- 108 SFX (tic-tac de l'anneau, badge, pops des pastilles). QC : 39,2 s, -14,0 LUFS, TP -1,4 dBTP, synchro médiane -11 ms.

## 2026-11-14 (3) — Vidéo Tech Fleece kangourou (effets v3)
- Nouveaux effets `fx2` : tampons « 1:1 » (rouge) et « LEGIT ✓ » (vert) qui s'écrasent sur les cartes (scale 1,7→1 + shake),
  position réglable par section (`stampY`) pour ne pas masquer le détail ; balayage lumineux jaune entre les étapes.
- 8 images extraites d'une vidéo utilisateur en 576×1024 (gros plans 1:1 issus des encarts → un peu plus doux).
- 96 SFX (impacts des tampons, swish du balayage). QC : 38,3 s, -14,0 LUFS, TP -1,5 dBTP, synchro médiane 0 ms.

## 2026-11-14 (2) — LegitCheck paramétrable + vidéo Phenom Elite (v2 des effets)
- `LegitCheck.tsx` piloté par une config (`src/nrd/configs.ts` : nrdCfg, phenomCfg) → une nouvelle vidéo = images + timings Whisper.
  Nombre de détails libre (score « ?/N »), sous-titre de section, marque ✗ décalée (`fakeMarkAt`).
- Effets v2 (`fx: true`) : focus sur la carte commentée (zoom 6 %, l'autre s'assombrit), balayage lumineux sur le vrai,
  saut du personnage sur chaque « vrai », punch caméra sur les coupes, prix et bénef qui comptent jusqu'à leur valeur.
- Phenom Elite : 9 images extraites de la vidéo de l'utilisateur (zones sans texte incrusté), voix Roger v4, 80 SFX
  (riser avant la révélation, whoosh de focus, ticks de compteur sur les prix).
- Leçon : ElevenLabs a d'abord rendu seulement le 1er paragraphe (8,75 s) → coller le script en un seul bloc et vérifier la durée.

## 2026-11-14 — Quiz legit-check pixel (ref09/ref10) + vidéo « bas NRD : 1:1 vs authentique »
- 2 nouvelles références analysées (contact sheets, transcription Whisper small, tempo 117,5 BPM) →
  nouvelle fiche `visual-styles/pixel-legit-quiz.md` (format réellement nouveau : quiz vrai/faux + personnage pixel).
- Composition Remotion `LegitCheck` (`src/nrd/LegitCheck.tsx`) : cartes photo, compte à rebours 3-2-1, révélation
  vert/rouge, 4 détails (couleur, logo, étiquette, damiers) avec crochets de visée, HUD score, outro ?/4 → prix → bénef → DM.
- Personnage pixel original généré en Python (`projects/nrd-legit-check/sprite.py`, 13 poses), texte tapé en Silkscreen.
- Voix ElevenLabs fournie par l'utilisateur (Kevin, v4) ; 67 SFX 8-bit (jsfxr/zzfx/uisfx) placés par `sfx_plan.py`.
- QC : 41,6 s, 1080×1920, 30 fps, -14,0 LUFS, TP -1,4 dBTP, synchro médiane -3 ms → OK.
- Corrigé avant livraison : trous entre sections (crash `sec` undefined), « EN DM » qui passait à la ligne.
- Outillage : faster-whisper plante avec PyAV récent sur un chemin de fichier → passer un tableau numpy (soundfile).

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
