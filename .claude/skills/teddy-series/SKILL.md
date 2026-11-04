---
name: teddy-series
description: Produit les épisodes de la série interactive « J-30 : le glow up de Teddy » (genre glow-up interactif, 2D cartoon) — fichier d'épisode, voix, sous-titres « punch » 1–2 mots, rig 2D de Teddy, décors, HUD J-x/GLOW, annotations, carte de vote, rendu 60 fps. À utiliser pour écrire, animer ou rendre un épisode de Teddy ou un format glow-up interactif.
---

# Série Teddy J-30 — pipeline d'épisode

Références : `projects/teddy-j30/BIBLE.md` (DA, personnages, structure), analyse du genre
`references/visual-styles/interactive-glow-up.md`, script ép. 1 `projects/teddy-j30/ep01-J30-script.md`.

## Briques (templates/remotion-kinetic/src/teddy/)
| Fichier | Contenu |
|---|---|
| `Teddy.tsx` | Rig 2D SVG : niveaux 1 et 5, expressions (neutral, happy, proud, shock, sad, panic, smug, wink), bras à l'épaule (`armL/armR` en degrés, négatif = vers le centre), inclinaison de tête, squash & stretch, mèche antenne à ressort (`antennaKick`), clignements, nuage + mouche Bzz, objet tenu (`holding`), ancres `TEDDY_ANCHORS` |
| `Sets.tsx` | Décor `Grotte`, `Hud` (J-x + jauge GLOW + niveau, slam), `PunchCaptions`, `Annotation` (cercle tracé + étiquette élastique), `Invitation`, `RankBadge` |
| `Episode.tsx` | Mise en scène de l'ép. 1 partie 1, entièrement calée sur les repères de voix |
| `RigTest.tsx` | Planche de contrôle du rig (composition `TeddyRigTest`) |

## Procédure
1. Écrire `projects/teddy-j30/epXX/partN.json` : lignes de VO (`id`, `text`, `pause` de mise en
   scène, `replace` d'affichage « VINGT-QUATRE ANS » → « 24 ANS », `colors` des mots-clés :
   gold/pink/cyan/red/violet/orange), SFX calés sur des repères (`cue` = id de ligne, `Lxend` = fin
   de parole, `start`).
2. `python3 tools/teddy_build.py projects/teddy-j30/epXX/partN.json --out <dossier>` → voix,
   sous-titres groupés, musique (drop sur `drop_cue`), SFX, mix, `episode.json`.
3. Mise en scène dans une composition (modèle : `Episode.tsx`) en utilisant `c('L3', 0.2)` pour
   caler chaque action sur la voix.
4. Contrôle : `npx remotion bundle` puis `remotion still` sur 8–10 instants clés → corriger.
5. Rendu : `npx remotion render src/index.ts TeddyEp out.mp4 --props=<episode.json> --concurrency=4`
   (2D : ~0,5 s/frame, 15 s à 60 fps ≈ 7–8 min) → `tools/finish.sh` → `tools/qc_check.py`.

## Grammaire des sous-titres (mesurée sur les références, image par image)
- 1–2 mots (3 si ≤ 9 caractères), ≤ 13 caractères ; mots-outils accrochés au mot suivant ;
  le mot-clé ferme le groupe et est coloré en entier ; jamais à cheval sur deux phrases.
- Anton (condensé), blanc, contour nuit 11 % de la taille, ombre dure 7 % ; ~74 % de la hauteur.
- Entrée : échelle 0,45 → 1,15 en ~3 frames (30 fps) puis 0,97 → 1,0 vers la 6e ; **pas de sortie**
  (coupe franche) ; un pop sonore discret par groupe.

## Erreurs déjà corrigées
- « J-30 » qui passait sur 2 lignes (largeur 210 + nowrap) ; étiquette d'annotation coupée par le
  zoom (texte court, centrée sur la cible) ; badge hors-zoom qui chevauchait (masqué pendant le zoom) ;
  fin de ligne = fin de la pause (→ fin de PAROLE calculée = début ligne suivante − pause).

## Disponible depuis l'ép. 1 complet (`Props.tsx`, `EpisodeFull.tsx`, composition `TeddyEpFull`)
Saleté de la Grotte (`GrotteDirt`), `PizzaTower` (renversable), `SpareHoodie`, `MaskedFly`,
`Croquette` (marche + valise), `Phone` (tape/efface/pouce/vu), `MaxenceStory`, `MamieJoNote`
(vocal animé), `Checklist`, `VoteCard` + `DayBanner`, onomatopée « PAF ! », chute « crêpe »,
lip-sync simple (bouche pendant les répliques de Teddy), 3 voix (pitch/speed par ligne).
Rendu 59 s à 60 fps ≈ 42 min (concurrence 4).

## Reste à construire
Salle de bain + écran de stats, Teddy niveau 2–4, lip-sync piloté par l'enveloppe audio,
vraie voix (enregistrée ou neuronale), transitions whip entre lieux, bruitages d'animaux sous licence.
