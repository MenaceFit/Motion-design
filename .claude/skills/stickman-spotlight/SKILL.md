---
name: stickman-spotlight
description: Produit des vidéos verticales dans le style « Stickman Spotlight » — personnage-bâton noir à contour lumineux sous un projecteur doré, décors en line art pointillé (bureau, pluie, chambre, salle de sport, parc), étiquette de lieu, une couleur d'accent par scène — avec marche/course fluides à pieds verrouillés (IK), accessoires animés, pluie, bruits de pas synchronisés, musique lofi, 60 fps. À utiliser quand l'utilisateur demande ce style, un bonhomme-bâton / stickman animé, une histoire « une journée en N lieux », ou envoie une référence de ce type.
---

# Stickman Spotlight — du plan JSON à la vidéo

Fiche de style : `references/visual-styles/stickman-spotlight.md` (captures ref09/ref10).
Code : `templates/remotion-kinetic/src/stickman/` · audio : `tools/stickman_build.py`.

## Procédure (testée de bout en bout)
1. **Histoire** : 3–6 scènes de 3,5–5 s. Une scène = un lieu (étiquette) = une action = une
   légende courte. Arc émotionnel (routine → creux → retournement). Hook dès la 1re scène
   (légende lisible avant 1 s). Contenu et textes 100 % originaux.
2. **Écrire** `projects/<slug>/stick.json` (modèle : `projects/stickman-demo/stick.json`) :
   ```json
   {"slug": "x", "character": "man", "music": {"mood": "lofi", "bpm": 78, "drop": 1.2, "seed": 4, "db": -17},
    "scenes": [{"label": "Office", "set": "office", "duration": 4.2, "motion": "walk", "prop": "folder",
                "caption": "9h. Il sourit à *tout le monde.*",
                "beats": [{"at": 2.7, "motion": "idle", "look": "up"}]}]}
   ```
   - `set` : office · rain · bedroom · gym · park · none
   - `motion` : walk · happy · sad · sneak · run · idle
   - `prop` : folder · umbrella · phone · coffee · bag · none (choisit les bras par défaut)
   - `arms` (optionnel) : swing · carry · umbrella · phone · coffee · bag · pocket · wave · cheer · facepalm
   - `look` : fwd · down · up · back ; `facing` : 1 / -1 (demi-tour animé) ; `character` : man / woman (par scène possible)
   - `beats` : changements DANS la scène (`at` en s depuis le début de scène) → s'arrêter, regarder
     son téléphone, repartir… Toujours mélangés en 0,4 s.
   - `caption` : `*mot*` ou `*plusieurs mots*` = couleur du faisceau + petit pop sonore.
   - Couleurs : `lineColor`, `lightColor`, `glowColor`, `accent` (par scène) ; `frame: false` retire le cadre.
3. **Audio** : `python3 tools/stickman_build.py projects/<slug>/stick.json --out renders/<slug>`
   (exécute le moteur d'animation dans Node → temps exacts des appuis de pied → pas secs/mouillés,
   allumage néon, scintillement du décor, whoosh de fin de scène, pop des mots-clés, pluie, musique lofi, mix).
4. **Contrôle du moteur** : `node --experimental-strip-types --no-warnings scripts/stickman_check.ts <plan.json>`
   (depuis `templates/remotion-kinetic`). **Contrôle images fixes** (rapide) avant le rendu :
   `cd templates/remotion-kinetic && npx remotion bundle src/index.ts --out-dir <tmp>/bundle` puis
   `npx remotion still <tmp>/bundle StickStory s.png --frame=<f> --props=renders/<slug>/props.json`
   sur 1 image par scène + 1 par changement de beat. Planche des allures : composition `StickRigTest`.
5. **Rendu** : `npx remotion render src/index.ts StickStory renders/<slug>/raw.mp4 --props=renders/<slug>/props.json --concurrency=4`
   (mesuré : ~21 s de calcul par seconde de vidéo à 60 fps ; `StickStory30` pour un brouillon 2× plus rapide).
6. **Finition + QC** : `tools/finish.sh raw.mp4 final.mp4 && python3 tools/qc_check.py final.mp4 --fps 60 --events renders/<slug>/qc_events.json`
   (`--fps 60` obligatoire, sinon échec sur la cible 30 fps par défaut).

## Pourquoi c'est fluide (principes codés dans engine.ts — à conserver)
1. **Pieds verrouillés** : trajectoire de pied dans le repère du bassin (appui = recule à vitesse
   constante au sol, attaque talon puis déroulé sur la pointe ; balancier = arc avec « kick ») +
   **IK 2 segments** pour le genou. Le monde avance exactement du déplacement du point d'appui
   (mesuré : glisse ≤ 0,02 px/frame, 0 pénétration du sol).
   + **verrouillage monde par pied** : un pied posé garde sa position même quand la foulée change
   en double appui (arrêt, changement d'allure) ; la correction se résorbe au balancier suivant.
2. **Rebond du bassin** explicite (bas à l'attaque, haut en milieu d'appui), vol en course.
3. **Phase intégrée** dans le temps : changer d'allure ne fait jamais sauter le cycle ; les
   paramètres d'allure sont **interpolés** (pas les angles) → transitions marche ↔ course ↔ arrêt propres.
4. **Couches** : jambes = allure, haut du corps = action (bras, tête), mélangés séparément.
5. **Effets secondaires en retard de phase** : queue de cheval, parapluie, mallette.
6. **Caméra** : moyenne glissante sur ~1 s → le décor défile régulièrement, le corps « pousse » un peu.
7. **60 fps** + tout déterministe (`rnd()`, `wobble()`, jamais `Math.random`).
8. **Son calé sur l'image** : les pas viennent du même moteur que l'animation (pas de dérive).

## Grammaire visuelle
- Noir ≈ 80 % de l'image ; une seule couleur d'accent par scène (l'accessoire).
- Entrée de scène : néon qui clignote (0,34 s), décor qui se dessine **point par point** en cascade
  (0,9 s), lettres de l'étiquette en cascade. Sortie : lumière à 22 %, décor qui se rétracte (0,4 s).
  Jamais d'image entièrement noire (QC blackdetect).
- Légende révélée mot à mot à ~1600 px, mise en page fixe (≤ 22 caractères/ligne).

## Ajouter un décor
Dans `Sets.tsx` : une fonction → `{W, back, mid}` ; éléments avec `R/L/C/E/P` (repère : sol = y 0,
négatif vers le haut, x centré). `o` = opacité, `gap` = pas des points, `solid+glow` = source
lumineuse (lampe, lune). Largeur de tuile ≥ 1300 (elle se répète). Vérifier par `remotion still`.

## Ajouter une allure / une action
- Allure : une ligne dans `GAITS` (cycle, stride, stance, lift, kick, bob, hh = hauteur du bassin,
  angles du pied, bras…). Garder `hh` ≥ 368 pour une marche droite (sinon genoux trop pliés —
  erreur déjà commise) et vérifier la portée (`stride/2` + talon ≤ ~120 px à la hauteur basse).
- Action : un `case` dans `armPose` (angles épaule/coude, cou).
- Tester : `cd templates/remotion-kinetic && node --experimental-strip-types --no-warnings scripts/stickman_check.ts [plan.json]`
  (échoue si glisse > 1 px/frame ou pénétration > 0) + planche `StickRigTest`. À lancer sur chaque plan avant le rendu.

## Erreurs déjà corrigées
- Cycle sinusoïdal brut : pied qui touche le sol trop tôt → 14 px/frame de glisse → remplacé par IK.
- Arrêt marche → immobile : 5,6 px/frame de glisse en double appui (invisible sur images fixes,
  trouvé par `stickman_check.ts`) → verrouillage monde par pied.
- Décor trop sombre (masque de lumière trop fort) → opacités relevées + halo léger.
- Parapluie décentré par rapport à la tête → inclinaison de -13°.
- Mots-clés multi-mots non colorés → `highlightFlags()` (même règle en Python pour les pops).

## Limites
- Analyse de référence faite sur **2 captures**, sans vidéo ni son : rythme et sound design de
  l'original non mesurés.
- Un seul personnage à l'écran ; pas d'interaction entre personnages ; pas de voix off intégrée
  (possible via `tools/tts_voice.py` + `mix_audio.py --voice`).
- Bruitages et musique synthétisés (propres mais moins organiques que des enregistrements).
