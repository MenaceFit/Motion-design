---
name: gta-footage-sourcing
description: Trouve, télécharge, indexe et tague du footage GTA 6 RÉEL (trailers et captures officiels Rockstar, ou gameplay fourni par l'utilisateur) avec traçabilité, et vérifie chaque fait (codes de triche, astuces, lieux) sur au moins 2 sources. À utiliser avant tout montage GTA, quand l'utilisateur fournit de nouvelles vidéos/trailers, ou demande « trouve des images / des plans de … ».
---

# Sourcing de footage GTA 6 + vérification des faits

**Règle d'or : rien n'est inventé.** Les images viennent de sources réelles (téléchargements
officiels Rockstar, captures de l'utilisateur) ; jamais générées, jamais « reconstituées ». Les faits
(codes, emplacements, montants, conditions) sont vérifiés sur **≥ 2 sources indépendantes** et listés
dans `plan.json > sources`. Si une info n'est pas confirmée → on ne la dit pas.

## Prérequis réseau (environnement « Motion-design »)
`www.rockstargames.com` et `media-rockstargames-com.akamaized.net` autorisés (ajoutés le 2026-11-20).
Si un téléchargement échoue avec un refus du proxy : lire la doc `environment.network` puis proposer
l'ajout de l'hôte exact (jamais de joker). YouTube/TikTok ne sont **pas** téléchargeables (hôtes
`googlevideo` variables) → demander le fichier à l'utilisateur.

## 1. Récupérer le footage
```bash
python3 tools/gta_source.py fetch all          # trailers 4K + pack de 155 captures + clips du site
python3 tools/gta_source.py ingest ma_capture.mp4 --origin "capture PS5 de l'utilisateur, 2026-11-21"
python3 tools/gta_source.py show                # résumé de footage/provenance.json
```
- Tout atterrit dans `footage/raw/` (ignoré par git, ~3,5 Go) avec une entrée de provenance
  (URL, sha256, date, note de droits).
- « An Extended Look » (14 Go) est exclu par défaut (`--max-gb`, `--include Extended`).
- Uploads de l'utilisateur (`/root/.claude/uploads/...`) → `ingest` avec une origine explicite.

## 2. Indexer
```bash
python3 -W ignore tools/footage_index.py build     # incrémental : proxies 640 px, plans, cadrage 9:16
python3 tools/footage_index.py sheets              # planches numérotées footage/index/sheets/*.jpg
```
- Plans : PySceneDetect (seuil 27, ≥ 5 frames). IDs stables : `T1-012` (Trailer 1), `T2-`, `LT-`
  (Launch Trailer), `ON-` (Out Now), `S-<nom>` (captures).
- Cadrage : visages **YuNet** (OpenCV DNN, modèle téléchargé depuis Hugging Face dans
  `footage/models/`) sinon saillance spectrale ; `focus=[x_début, x_fin]` → fenêtre 9:16 qui glisse.
  Sur les planches : rectangle **jaune** = cadre début, **bleu** = cadre fin.

## 3. Taguer à la vision (indispensable)
Lire chaque planche avec Read, puis écrire `references/gta-footage-tags.json` (versionné ; les IDs
de plans sont déterministes, les tags survivent donc à un conteneur neuf) :
`{"T1-012": {"tags": ["bateau","mer","vitesse"], "desc": "hors-bord qui fend l'eau", "q": 3, "avoid": false}}`
- `range: [a, b]` (fractions) : portion utilisable d'un plan long qui contient un fondu enchaîné ou un carton
  (vérifier les triptyques début|milieu|fin des plans > 3,5 s sur les planches).
- `q` 0–3 : 3 = plan « héros » (net, lisible en 9:16, action claire) ; 0 = inutilisable.
- `avoid: true` pour : cartons (ESRB, « Rockstar Games presents », logos, OUT NOW), noirs, plans
  < 0,3 s illisibles, **nudité / club de strip** (risque de démonétisation), UI de réseaux sociaux
  illisible.
- Vocabulaire de tags (FR, minuscules, `_`) : lieux (`vice_city`, `ocean_drive`, `keys`, `marais`,
  `plage`, `prison`, `marina`), persos (`jason`, `lucia`), véhicules (`voiture`, `voiture_de_sport`,
  `moto`, `bateau`, `jet_ski`, `hélicoptère`, `avion`, `hydroglisseur`), actions (`braquage`, `arme`,
  `poursuite`, `explosion`, `police`), ambiance (`nuit`, `jour`, `coucher_soleil`, `néon`).
- Vérifier : `python3 tools/footage_index.py stats` puis
  `python3 tools/footage_index.py search --tags voiture nuit --limit 10`.
- Les captures officielles ont des tags automatiques depuis leur dossier (`people/jason duval`,
  `places/vice city`).

## 4. Vérifier les faits (codes, astuces)
1. `firecrawl_search` (sources web + news) → choisir ≥ 2 sites indépendants (presse jeu vidéo,
   guides reconnus). Lire la page (`firecrawl_scrape`, format `query` + `directQuote` pour économiser).
2. Recouper **mot à mot** : séquence de touches, montant, condition de déblocage, effets secondaires.
3. Noter dans `plan.json > sources` : `{"claim": "...", "urls": ["...", "..."]}` (le build avertit si < 2).
4. Méfiance : listes « codes leakés », vidéos « ALL CHEATS LEAKED?! », numéros de téléphone GTA 5
   recyclés (Red Bull, 2026-11-18 : aucun code par téléphone dans GTA 6).

## Droits et monétisation (à rappeler à l'utilisateur)
- Politique Rockstar (support.rockstargames.com, maj 2025-01-10) : usage fan **non commercial**
  toléré, retrait possible à tout moment ; interdits : leaks pré-sortie, **triche en ligne** (glitchs
  d'argent GTA Online, god mode, duplication). Les codes de triche **solo** officiels sont OK.
- « Non commercial » = ne pas gagner d'argent grâce au footage → **aucune garantie de monétisation**.
- Audio des trailers = chansons sous licence → **toujours muet** (le pipeline n'en extrait jamais).
- Créditer : « Images : Rockstar Games » à l'écran (paramètre `credit`).

## Limites connues
- Pas de gameplay réel du jeu tant que l'utilisateur ne fournit pas ses captures : les trailers
  montrent l'univers, pas les menus/cartes/emplacements précis. Pour un tuto « va à tel endroit »,
  demander une capture de la carte et du lieu.
- Saillance/visages : cadrage à vérifier sur la planche pour les plans larges à 2 personnages.
