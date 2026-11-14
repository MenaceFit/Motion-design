# Style « Retro Sunset » (synthwave années 80)

Demandé comme « style Vice City » : on reprend les **principes** de l'esthétique rétro-néon
années 80, jamais les assets d'un jeu (pas de logo, police « Pricedown », personnages, noms
« Vice City » / « Leonida », captures). Tout est procédural et original.

## Grammaire visuelle
- Ciel dégradé nuit → violet → rose (`#0b0220 → #3a0a5e → #ff4f8b`), étoiles qui scintillent.
- Soleil rayé jaune → rose (`#ffd319 → #ff2975`), bandes qui défilent, léger « souffle » ; plus gros au climax.
- Horizon à 66 % de la hauteur, grille néon magenta en perspective qui avance (lignes en z²).
- Palmiers en silhouette (bords gauche/droit), balancement lent.
- Texte 3D Montserrat Black italique : face blanc rosé, mots-clés rose `#ff2bd6`, split cyan `#22f1ff`.
- Sous-titres karaoké, mot actif cyan.

## Overlays de série interactive (`src/RetroOverlays.tsx`)
- `episode` : badge néon « ÉP. N » + sous-titre (haut gauche, y = 240 px, hors zone onglets TikTok).
- `gauge` : jauge d'abonnés à paliers (haut droite), valeur réelle à renseigner à chaque épisode.
- `vote` : carte A/B/C qui apparaît à `from_line` jusqu'à la fin ; options en pop alterné G/D + pops SFX ;
  le texte 3D passe en position basse pendant le vote (pas de masquage).

## Pièges mesurés au rendu
- Compteur 3D > 5 caractères (« 10 000 ») déborde en 9:16 → utiliser `to: 10, suffix: "K"`.
- Voile sombre central trop fort → soleil terne : garder ≤ 0,3 d'opacité.

Plan exemple : `projects/serie-jeu-ep01/plan.json` (`"theme": "retro"`, `"decor": {"type": "retro"}`).
