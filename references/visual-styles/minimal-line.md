# Style « Minimal Line » — références : ref04 + ref05 (@vertusmental)

Sujets : ref04 « Ton entourage te tire vers le bas » ; ref05 « Tout le monde veut devenir riche,
vite… tiens bon ». Développement personnel, ton posé.

## Identité visuelle
- **Noir pur** (`#000000` ≈ 76–79 % des pixels) + **grille de points** très discrète (≈ 7 % d'opacité).
- **100 % monochrome** : traits blancs `#f7f9f9`, gris `#4d4b4c` pour les éléments secondaires.
  (Les seules couleurs mesurées sont celles du logo TikTok.) → coût de production minimal, lisibilité
  maximale, esthétique « Apple keynote / schéma ».
- **Pictogrammes** : personnage = cercle (tête) + demi-gélule (corps), plein blanc ; foule = même
  picto répété ; décor en line art 2–3 px : ligne de sol, porte, canapé, montagne, lampadaires,
  graphiques (axes + courbe), coffre-fort, sablier, chrono.
- **Micro-labels** : petites capitales très espacées (tracking ~+400) au-dessus des objets :
  `SOMMET`, `ZONE DE CONFORT`, `FOCUS`, `SECRET`, `JOUR`, `SEMAINE`, `GAINS`, `PATIENCE`.
- Bulles de dialogue en contour (« HA HA », « ON SORT CE SOIR ? »), cadre pointillé de sélection.

## Typographie
- **Sous-titre phrase** en bas (~85 % de hauteur), sans-serif neutre SemiBold (proche Inter / SF Pro),
  casse normale, ~4 % de la hauteur d'image, léger glow blanc.
- **Révélation mot à mot** : la phrase complète a sa mise en page fixe ; chaque mot passe de
  l'invisible/gris au blanc au moment exact où il est prononcé (pas de reflow).
- Grands chiffres pour les compteurs (`56`, `110`… `702`, `0 €`, `1 000 000 €`) en Bold.
- Titre final en capitales espacées « TIENS BON. » avec label au-dessus.

## Mouvement
- Mouvement global faible (moyenne 0,5–0,8) : **une seule chose bouge à la fois** → l'œil suit
  la narration.
- Techniques : **stroke draw** (lignes qui se dessinent : sol, pente, graphique), pictos qui
  apparaissent en pop ou glissent, foule qui se vide progressivement (disparitions en stagger),
  **compteurs qui défilent** (4 000 € → 1 000 000 € en ~1,5 s ; JOUR 56 → 702), courbe plate qui
  devient exponentielle à la fin, rayons de soleil qui jaillissent au sommet.
- Caméra : travelling latéral (marche entre les lampadaires), recadrages/zooms lents, transition
  « waveform » (ligne de bruit qui s'aplatit en ligne droite = « moins de bruit »).

## Découpage ref04 (contenu 0–36,5 s)
| TC | Visuel | Sous-titre |
|---|---|---|
| 0–2 | Sol qui se dessine, perso → porte | Tu veux changer de vie. |
| 2–11 | Foule, bulles « HA HA », laptop, lune | Mais regarde qui t'entoure. Ceux qui rigolent… qui t'appellent pour sortir… qui te disent de rester comme eux. |
| 11–14,5 | Canapé + cœur + cadre « ZONE DE CONFORT » | Ils ne sont pas méchants. Ils sont juste à l'aise là où ils sont. |
| 14,5–19,5 | Perso seul + corde ; cercle de persos | Et toi, tu veux monter. Ton cercle, c'est soit ton élan… soit ta distraction. |
| 19,5–26,5 | Montagne `SOMMET`, persos qui tirent vers le bas | Personne ne grimpe une montagne avec des gens qui le tirent vers le bas… |
| 26,5–29 | Waveform → ligne plate → cible `FOCUS` | Moins de bruit. Plus de focus. |
| 29–32,5 | Marche nocturne entre lampadaires (travelling) | Parfois, avancer, c'est avancer seul… un moment. |
| 32,5–36,5 | Sommet + drapeau + rayons, les vrais arrivent | Et le jour où tu réussis, tu verras qui était vraiment là. |

## Découpage ref05 (contenu 0–25,3 s)
| TC | Visuel | Sous-titre |
|---|---|---|
| 0–2,5 | Panneau compteur 4 000 € → 1 000 000 €, persos qui sautent, confettis | Tout le monde veut devenir riche. Vite. |
| 2,5–8,3 | HUD SEMAINE / GAINS 0 € ; un perso tombe | Alors ils commencent. Une semaine. Deux semaines. Pas de résultat… et ils lâchent. |
| 8,3–11,6 | Graphique barré → sablier `PATIENCE` | Le problème, c'est pas l'argent. C'est la patience. |
| 11,6–18,5 | Axes + compteur JOUR 56 → 702, courbe exponentielle finale | Au début, tu travailles et rien ne bouge… Mais chaque jour compte. |
| 18,5–21,5 | Coffre-fort `SECRET` | Ceux qui deviennent riches n'ont pas trouvé un secret. |
| 21,5–24 | Rangée de persos qui disparaissent un à un | Ils sont juste restés quand tout le monde est parti. |
| 24–25,3 | « TIENS BON. » | — |

## Sound design (mesuré)
- ref04 : **drone grave continu** (énergie forte < 300 Hz sur toute la durée) + nappes tonales
  (~1,1–1,4 kHz) → musique ambient/cinématique ; transitoires secs et réguliers alignés avec
  l'apparition des mots → cohérent avec des **clics/ticks UI** sur chaque mot (hypothèse forte).
- ref05 : même signature ; densité de transitoires accrue pendant les compteurs (ticks).
- Tempo estimé ~118 BPM pour les deux.

## Réutilisable / à remplacer
- Réutilisable : tout le langage (noir + grille + line art + pictos + micro-labels + sous-titres mot
  à mot + compteurs). C'est un **langage graphique générique** (schémas), pas propriétaire.
- À créer : nos propres pictos (proportions et silhouette différentes), nos métaphores, nos textes.

## Implémentation
Remotion : `templates/remotion-kinetic/src/LineStory.tsx` (sol + pente stroke-draw, drapeau,
perso qui avance par pas, sous-titre mot à mot). Testé, rendu validé.
