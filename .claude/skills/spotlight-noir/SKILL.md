---
name: spotlight-noir
description: Produit une vidéo verticale séduction / psychologie dans le style « Spotlight Noir » — titre-hook permanent, studio sombre à projecteurs, pictogrammes, une couleur d'accent, sous-titre en boîte blanche mot à mot, cartes mot-clé néon, whip pans, zooms traversants, glitchs, SFX synchronisés — via tools/make_noir.py. À utiliser pour toute vidéo séduction, relations, psychologie sociale, « pourquoi elle/il… », ou quand l'utilisateur cite les références ref09/ref10.
---

# Spotlight Noir (prompt → vidéo)

Style analysé : `references/visual-styles/spotlight-noir.md`. Composition : `src/noir/NoirStage.tsx`.

## 1. Script (règles `documentation/virality.md` + ce style)
- **Titre-hook** (affiché toute la vidéo) : question ou promesse ≤ 9 mots (« Pourquoi plus tu
  insistes, moins elle répond »).
- 1re phrase = image mentale forte, ≤ 1,5 s. Phrases ≤ 10 mots, tutoiement.
- **Une métaphore visuelle par phrase**, dont **une récurrente** (ex. la lumière = l'attention)
  qui revient 3–4 fois et se retourne à la fin.
- Une **carte mot-clé** toutes les 10–20 s (concept, nom scientifique, punchline).
- Faits : uniquement vérifiables (ex. réactance, Brehm 1966). Jamais de stat inventée présentée
  comme réelle ; une jauge ou un compteur illustre une idée, pas une mesure.
- Pas de manipulation : messages sains (respect, confiance en soi, pas de techniques pour
  contourner un refus). Durée : 35–45 s (viral) ou 61–90 s (rémunération, voir virality.md).
- Dernière ligne : CTA « Enregistre / Envoie-la à… ».

## 2. Plan `projects/<slug>/plan.json`
```json
{"slug": "x", "title": "Hook permanent", "accent": "#ff2d6f", "fps": 60,
 "voice": {"engine": "pico", "speed": 1.04} ,  "music": {"mood": "tension", "bpm": 96, "seed": 11, "db": -14},
 "lines": [{"text": "…", "accents": ["mot"], "pause": 0.5, "shot": {"type": "…", "in": "whip", "hud": "LABEL", …}}]}
```
- Une ligne sans `shot` prolonge le plan précédent. `"on": "mot"` démarre le plan sur ce mot.
- **Ancrage sur la voix** : toute valeur `"@mot"` / `"@mot+0.3"` = instant où le mot est dit
  (premier mot de la ligne qui commence par ce texte ; élisions gérées : « @écrit » trouve T'ÉCRIT).
  Attention aux mots répétés dans la phrase (« plus… plus ») : ancrer sur un mot unique.
- `voice: {"file": "voix.wav"}` = voix de l'utilisateur (recommandé : pas de label IA).
- Accent : une seule couleur. Rose `#ff2d6f` (séduction), citron `#d7ff1f`, cyan `#28e7ff`, rouge `#ff3040`.

| `type` | Paramètres | Pour dire… |
|---|---|---|
| `spotlight` | `figures[{x, kind:'m'/'f', hero, h, pose, flip, flipAt, moves[{at,to,dur,pose,face}], poseAt, dimAt, dropAt}]`, `lights[{x,w,to,at,dur,flickerAt,offAt}]`, `tags[{text,x,y,at,to:[x,y],accent}]` | qui fait quoi, distance, attention qui se déplace (la lumière suit) |
| `crowd` | `rows, per, hero, focusAt, leaveAt, label` | « tout le monde fait X », toi dans la foule |
| `versus` | `left, right, rows[{label,a,b,at}]` | comparaison toi / les autres |
| `gauge` | `label, from, to, at, dur, unit, danger` | intérêt, effort, énergie (l'aiguille tremble à la fin) |
| `heartbeat` | `label, from, to, at, dur, hot` | pression, stress, excitation (son lub-dub synchro) |
| `chat` | `msgs[{text, from:'me'/'her', at}], seen{at,text}, typingAt, leaveAt, tilt, name` | messages, vu, relance |
| `counter` | `from, to, at, dur, prefix, suffix, label` | chiffre-clé, règle (3 → 1) |
| `keyword` | `word, sub, noCaption: true` (+ `on`) | concept, punchline (néon + flash + étincelles + boom) |

Poses : `stand walk run wave push point shrug back`. Scène carrée 1080×1080 ; sol à y = 760 ;
pieds à y ≈ 800 ; personnage de 300 px ; tags vers y 200–450.
Transitions `in` : `whip` (défaut, alterner les sens avec `dir`), `zoom` (entrer dans un détail),
`glitch` (avant une carte mot-clé), `flash` (retournement / solution), `cut`.

## 3. Produire
```bash
python3 tools/make_noir.py projects/<slug>/plan.json --out renders --no-render     # voix + audio + timings
cd templates/remotion-kinetic && npx remotion render src/index.ts NoirStage30 /tmp/prev.mp4 \
  --props=../../renders/<slug>/props.json --scale=0.5 --concurrency=4                 # aperçu ≈ 0,12 s/image
python3 tools/make_noir.py projects/<slug>/plan.json --out renders                  # final 60 fps ≈ 1 s/image
```
Toujours : aperçu → planche d'images (milieu de chaque plan + 3 transitions) → corrections → final.

## 4. Contrôles
- `renders/<slug>/qc.txt` OK (format, -14 LUFS, pas de noir/figé hors cartes).
- Sur la planche : personnages qui ne se chevauchent pas, tags non coupés, sous-titre ≤ 1 ligne,
  carte mot-clé lisible ≥ 0,8 s, aucune image vide pendant les whips.
- Sons : chaque SFX vient d'un événement (`sfx.json`), creux musical avant chaque boom.

## Erreurs déjà rencontrées
- Whip en 2 phases séparées → 2–3 images noires au milieu : les deux plans doivent glisser ensemble.
- Flash gris du glitch trop long (2 images à 30 fps) → 1 image suffit (mesure ref09).
- Ancre `@plus` sur la 1re occurrence au lieu de la 2e → ancrer sur un mot unique.
- `--props` relatif refusé par Remotion (cwd différent) → chemins absolus.
- librosa `beat_track` segfaulte (numba 0.68) → `analyze_reference.py` utilise `feature.tempo`.
