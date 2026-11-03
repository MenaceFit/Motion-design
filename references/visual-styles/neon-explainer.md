# Style « Neon Explainer » — référence : ref01 (@declic.mp3)

Sujet de la référence : « Avoir de mauvaises notes, est-ce être bête ? » → l'école mesure
l'obéissance, pas l'intelligence (Edison, Einstein, Jobs, Gates en contre-exemples).

## Identité visuelle
- **Fond** : dégradé radial violet nuit, centre `#451741` → bords `#16071a` (mesuré, k-means), vignette
  forte, particules/cercles fins qui dérivent lentement (bokeh discret).
- **Personnages** : flat design « bonhomme pilule » sans visage détaillé (2 yeux points), sans bras
  articulés complexes ; couleur = rôle : **bleu `#457ced`** = l'élève/le sujet, **orange `#e1a43d`** =
  les génies/les gagnants, **gris** = la foule conforme.
- **Objets-métaphores** flat avec léger dégradé et ombre douce : copie notée 4/20, balance dorée,
  cerveau néon cyan, pince mécanique, tampon/presse, horloge, engrenages, atome, diplôme sur écran.
- **Néons** : lignes de sol lumineuses (vert `#6fe1b5`, magenta), étiquettes néon (« ERREUR DE MESURE »,
  « OUI », « CONSIGNE ») = HUD narratif.
- **Climax chromatique** : à 43 s la palette bascule vers **l'or chaud** (ville dorée + soleil) =
  conclusion positive. Le changement de température colore l'émotion.

## Typographie
- 1 mot à la fois, **centré**, sans-serif **Black Italic** (proche Montserrat 900 Italic), MAJUSCULES.
- **Split bicolore** dans le mot : 1re moitié rouge `#ef3d51`, 2e moitié bleu `#457ced` (ou
  cyan/vert, violet/rose selon le mot) ; contour sombre + ombre portée dure décalée vers le bas.
- Taille : ~45–55 % de la largeur du cadre pour un mot de 8 lettres. Le mot passe **devant** les
  illustrations (superposition assumée).
- Rythme : nouveau mot toutes les **0,3–0,6 s** (= débit de la voix).

## Mouvement
- Mots : apparition *cut* + micro-punch de scale (≈ 1,1 → 1,0 en 4–6 frames), parfois glitch RGB
  de 2 frames sur les mots-clés.
- Illustrations : entrées pop (scale 0 → 1 avec overshoot), pince qui descend (ease-in-out), balance
  qui bascule (rotation avec rebond), tampon qui frappe (ease-in rapide + squash), horloge qui tourne.
- Caméra : principalement fixe ; **push-in** sur le gros plan de la tête (21–25 s) ; plan foule en
  léger travelling.
- Changement de scène toutes les **~1,9 s** (26 plans / 45 s), cut sec ou flash.

## Découpage (contenu 0–45 s)
| TC | Scène / métaphore | Mots à l'écran | Rôle narratif |
|---|---|---|---|
| 0,0–3,5 | Élève bleu + copie 4/20 + loader rouge | AVOIR MAUVAISES NOTES QUE BÊTE ? | Hook-question |
| 3,5–7,8 | Balance dorée (copie vs cerveau) + foule grise | PLUPART OUI VÉRITÉ C'EST L'INVERSE | Idée reçue → retournement |
| 7,8–10,4 | Cerveau néon + pince + tag « ERREUR DE MESURE » | NOTES JAMAIS MESURÉ TON INTELLIGENCE | Thèse |
| 10,4–12,3 | Pince qui extrait de l'élève | ELLES TESTENT TA MÉMOIRE | Argument 1 |
| 12,3–14,1 | Ligne néon verte + panneau « CONSIGNE » | TA CAPACITÉ OBÉIR | Argument 2 |
| 14,1–15,7 | Bureau la nuit, lampe, lune | ÉLÈVE RÉVISE NUIT | Exemple |
| 15,7–18,1 | Portique validé ✓ | RÉUSSIRA CONTRÔLE GÉNIE RATE | Contraste |
| 18,1–21,2 | Presse/tampon sur ligne magenta, « NON » | JUSTE LE GÉNIE NON RENTRER MOULE | Métaphore du moule |
| 21,2–25,1 | Gros plan tête bleue, ✓/✗, bâillon | ÇA N'EST L'INTELLIGENCE C'EST L'OBÉISSANCE | Punchline 1 (push-in) |
| 25,1–29,7 | Skyline « ÉCOLE », engrenages, tapis roulant | ÉCOLE MODERNE NÉE RÉVOLUTION INDUSTRIELLE FABRIQUER DES DOCILES | Origine historique |
| 29,7–32,0 | Horloge + foule | REMETTENT JAMAIS L'AUTORITÉ QUESTION | Conséquence |
| 32,0–41,2 | Edison / atome Einstein / Jobs / écran diplôme Gates « INCOMPLET » | EDISON ? INSTITUTEUR BÊTE… EINSTEIN ? LENT… JOBS ABANDONNÉ… GATES JAMAIS HARVARD | Preuves (énumération rapide) |
| 41,2–45,0 | Rangée de génies orange → ville dorée + soleil | AUCUN DE NOTES… TOUS ONT [CHANGÉ LE] MONDE | Conclusion, bascule chaude |

## Sound design (mesuré, pas « écouté »)
- Spectrogramme : voix dominante + **nappe musicale tonale** (raies horizontales stables ~100 Hz et
  ~550 Hz), tempo estimé ~118 BPM.
- Transitoires large bande courts (jusqu'à 16 kHz) près des changements de scène → cohérent avec
  pops/whooshes discrets ; la voix masque une partie des SFX, séparation de sources impossible ici
  (modèles Demucs non téléchargeables dans ce conteneur).
- Pic RMS -4,5 dBFS, mix fort typique TikTok.

## Ce qu'on réutilise / ce qu'on remplace
| Réutilisable (principes) | À remplacer obligatoirement |
|---|---|
| 1 mot géant synchro voix, split bicolore, contour + ombre dure | Le texte, le sujet, le script |
| Code couleur par rôle de personnage | Les personnages exacts (dessiner notre propre mascotte) |
| Fond radial sombre + particules | Les illustrations (balance, pince…) : créer nos métaphores |
| Bascule chromatique au climax | Le watermark, le nom du compte |
| Rythme 1 scène / ~2 s, 1 mot / ~0,4 s | — |

## Implémentation
Remotion : `templates/remotion-kinetic/src/KineticWords.tsx` (mot pop + split + fond + SFX auto).
Reste à construire : bibliothèque de personnages SVG originaux + scènes-métaphores (voir changelog).
