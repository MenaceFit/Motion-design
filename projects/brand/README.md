# Identité de la chaîne TikTok

## Nom recommandé : **Vice Codes**
- Pseudo : `@vicecodes`, ou `@vicecodes.fr` / `@vicecodes_` s'il est pris (TikTok indique la disponibilité dans l'appli).
- Nom affiché : **Vice Codes | GTA 6**. « GTA 6 » va dans le nom affiché et la bio (c'est indexé par la
  recherche TikTok), mais pas dans le pseudo, pour ne pas ressembler à un compte officiel.
- Pourquoi : court, se dit à l'oral (« abonne-toi à Vice Codes »), évoque Vice City sans reprendre de
  marque déposée, et annonce le contenu (codes, astuces). Il reste valable pour d'autres sujets GTA
  (secrets, argent, easter eggs).

Alternatives : **Code Leonida** (`@codeleonida`), **Leonida Secrets** (`@leonidasecrets`),
**Le Coffre de Vice** (`@lecoffredevice`).

## Photo de profil (1080×1080, design original, sans logo ni police Rockstar)
| Fichier | Idée | Recommandation |
|---|---|---|
| `avatar_dpad.png` | croix directionnelle jaune avec « $ » : on comprend « codes de triche » d'un coup d'œil | **conseillé** |
| `avatar_mono.png` | monogramme « VC » sur soleil rayé | le plus lisible en tout petit |
| `avatar_tag.png` | étiquette « VICE / CODES », comme l'accroche des vidéos | à éviter sous 60 px |

`preview_rond.png` montre chaque avatar à 300, 110 et 56 px, recadrés en rond comme dans TikTok.
Charte commune avec les vidéos : jaune `#FFD23F`, rose néon `#FF3D9A`, cyan `#3DE8FF`, fond `#0b0710`.

## Bio (80 caractères max)
`Codes, secrets et astuces GTA 6 💸 Une astuce par vidéo 👇`

## Régénérer / modifier
```bash
cd templates/remotion-kinetic
npx remotion still src/index.ts ChannelAvatar out.png --props='{"variant":"mono","mono":"VC"}'
```
