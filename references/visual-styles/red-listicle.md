# Style « Red Listicle » — référence : ref12 (psychologie, « Les 3 signes des overthinkers »)

Proche de la famille Minimal Line (noir, pictos au trait) mais avec une grammaire différente :
**typographie géante bicolore au centre** (pas de sous-titre bas), **structure en liste numérotée**
et **fil d'Ariane de chapitre** en haut. Fiche séparée car ces trois choix changent le montage.

## Format (mesuré)
- 576×1024 natif vertical, 30 fps, 61,3 s de contenu (+ carte de fin 3,5 s). 22 plans détectés,
  plan moyen 2,95 s, mouvement moyen **0,62** (très calme : une seule chose bouge à la fois).
- Palette : noir `#000000` 87 %, blanc `#f0f0f0`, **rouge `#e6011d`** (seule couleur, 52 % des
  pixels saturés), rose pâle `#db6678` pour les pictos « actifs ».
- Loudness -15,2 LUFS, LRA 3,8.

## Grammaire
- **Fil d'Ariane** en haut à gauche, monospace minuscule très espacé : « ■ RECODE · OVERTHINKERS »
  → « ■ 01 SIGNE 01 · RUMINATION » → « ■ 04 LE PROBLÈME ». Trait fin sous le bandeau, rouge sur
  la longueur du chapitre en cours (barre de progression de chapitre).
- **Pictogramme au trait** (cerveau, galerie d'images, chat, checklist, lune, batterie, horloge)
  dans le tiers haut ; particules qui « respirent » autour du cerveau d'intro.
- **Mot-bloc géant** condensé (type Anton/Oswald Bold) centré, 1–3 lignes, **mots-clés en rouge**,
  le reste en blanc (« LES **3** SIGNES DES **OVERTHINKERS** », « TOUT **CONTRÔLER** »).
- **Badges numérotés** `01 02 03` (carrés contour blanc, celui en cours rempli rouge) = promesse
  de liste dès 2 s → boucle ouverte (« il en reste 2 »).

## Mouvement (mesuré image par image, 4,2–5,0 s)
- Révélation du texte par **balayage gauche → droite à bord dégradé** (~8 images), sortie en fondu
  rapide (~4 images), noir vide ~5 images, puis badge `01` qui **pop** (scale 0 → 1, ~4 images).
- Pictos : apparition en fondu + légère montée, flèches de cycle qui tournent, jauge qui se remplit
  (contrôle → anxiété), courbe qui chute vers un panneau ⚠.
- Aucun mouvement de caméra : c'est le texte qui rythme.

## Sound design (mesuré, pas écouté)
- **Impact sub-basse à 0,0 s** (énergie forte < 150 Hz qui décroît sur ~0,5 s) = hook sonore.
- Nappe tonale continue (raies stables ~300–600 Hz et ~1,2 kHz), pas de batterie.
- Voix très présente (-15 LUFS intégré) ; transitoires larges bande aux apparitions de blocs.

## Structure
Titre-liste (0–4 s) → badges 01/02/03 → pour chaque signe : nom du signe (chapitre) + 3–4 blocs
illustrés → « LE PROBLÈME » (synthèse des 3 badges autour du cerveau) → solution.
**Principe réutilisable** : liste numérotée annoncée au début + fil d'Ariane = l'utilisateur sait
où il en est → moins d'abandon sur 60 s.

## Réutilisable / à remplacer
- Réutilisable : liste numérotée + badges, fil d'Ariane de chapitre, mot-bloc bicolore, balayage
  à bord doux, sub au tout début.
- À remplacer : nom du compte dans le fil d'Ariane, textes, pictos (dessiner les nôtres).

## Implémentation
Pas encore de composition dédiée. Briques existantes : `LineStory` (pictos au trait),
`Captions`. À faire : composant `ChapterTrail` + `WipeWord` (balayage dégradé) + badges.
