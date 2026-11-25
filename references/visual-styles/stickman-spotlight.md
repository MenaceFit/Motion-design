# Style « Stickman Spotlight » — références : ref09 (OFFICE) + ref10 (RAIN)

Source : **2 captures d'écran TikTok** fournies par l'utilisateur (`references/analyses/ref09`, `ref10`).
⚠️ Pas de vidéo ni d'audio : le mouvement, le rythme et le son ci-dessous sont **déduits** des poses
figées et du genre, pas mesurés. À compléter dès qu'une vidéo de ce style est fournie
(`tools/analyze_reference.py`). Engagement visible sur ref09 : 45,4 K j'aime, 22,2 K commentaires
(ratio commentaires/likes ≈ 0,49 → format qui fait réagir : « et toi, tu es lequel ? »).

## Identité visuelle (mesurée sur les captures)
- **Noir quasi total** : ~80 % des pixels < 30/255. Contraste maximal, rendu « scène de théâtre ».
- **Un projecteur** : cône trapézoïdal chaud qui descend d'une petite source en haut, au centre ;
  dégradé plus dense en haut, flou sur les bords ; il finit sur une **flaque pointillée** elliptique au sol.
- **Décor en line art pointillé** or `#786437` → `#ebbc5c` (k-means pixels saturés) : tableau avec
  graphiques, bureau, écran (OFFICE) ; vitrines à rideau métallique, stores, lampe (RAIN).
  Le décor est plus lumineux près du faisceau et s'éteint vers les bords.
- **Sol** : ligne pointillée horizontale + hachures diagonales gris très sombre (perspective).
- **Personnage-bâton** : segments noirs épais à bouts ronds, **contour blanc fin + halo** ; tête =
  disque noir cerclé de blanc + **un seul point blanc** pour l'œil (regard = direction) ;
  articulations visibles (cuisse/tibia/pied en L, bras/avant-bras).
- **Profondeur** : bras et jambe du côté lointain en **gris semi-transparent** derrière le corps.
- **Variante femme** : robe trapèze noire contourée, queue de cheval.
- **Une seule touche de couleur par scène** = l'accessoire : barre dorée tenue à deux mains `#fdd886`
  (OFFICE), parapluie orange saumon `#e9ab87`/`#b57856` à baleines pointillées et bord festonné (RAIN).
- **Étiquette de lieu** en haut, au départ du faisceau : pastille gris très sombre, petites capitales
  grises très espacées (`OFFICE`, `RAIN`).
- **Cadre « carte »** : bord gris arrondi autour de l'image, quelques étoiles au-dehors.
- Pluie : traînées fines obliques gris clair, plus visibles dans le faisceau.

## Mouvement (déduit — hypothèses)
- Le personnage **marche sur place sous le projecteur** (poses de marche en pleine foulée, centré
  dans le cône sur les 2 captures) → soit le décor défile, soit la scène est un « tapis roulant ».
- Grammaire probable : une scène = un lieu = une action (porter, marcher sous la pluie…), l'étiquette
  change à chaque scène. Format série « une journée / une vie en N lieux ».

## Sound design (hypothèses, non mesuré)
Musique calme (lo-fi / piano), pas synchronisés, ambiance (pluie), allumage du projecteur.

## Réutilisable / à remplacer
- **Réutilisable** (langage générique) : noir + projecteur + décor pointillé + bonhomme-bâton à
  contour lumineux + membres lointains grisés + étiquette de lieu + 1 couleur d'accent par scène.
- **À créer nous-mêmes** : proportions et rig du personnage (les nôtres : torse long, pieds en L,
  halo blanc), tous les décors (5 dessinés en code), les textes, l'histoire, la musique.
- Ne jamais reprendre les compositions exactes des captures (placement tableau/bureau, etc.).

## Implémentation (testée)
`templates/remotion-kinetic/src/stickman/` — composition `StickStory` (60 fps), planche `StickRigTest`,
pipeline audio `tools/stickman_build.py`. Mode d'emploi : skill `stickman-spotlight`.
Rendu de test : `documentation/test-renders/stickman_story_test.mp4` (aperçu 540p) — 17,3 s,
60 fps, -14,0 LUFS, true peak -1,3 dBTP, pas synchronisés (médiane 12 ms, max 45 ms).
