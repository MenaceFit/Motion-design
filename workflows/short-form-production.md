# Workflow — Production d'une vidéo courte originale (9:16)

Exemple de cible : vidéo éducative/développement personnel de 30–45 s, style d'une fiche de
`references/visual-styles/`.

## Étape 0 — Arborescence projet
```
projects/<AAAA-MM-JJ>_<slug>/
  brief.md            objectif, plateforme, durée, public, style, CTA
  script.md           texte + mots-clés + métaphores
  storyboard.md       tableau TC
  audio/voice.wav     voix off sèche (48 kHz)
  audio/music.*       + licence.txt
  words.json          timings mot à mot
  props.json          entrée de la composition Remotion
  renders/            exports bruts / finaux + rapports QC
```

## Étape 1 — Brief (l'utilisateur)
Une question à la fois uniquement si une info bloque : sujet, style visé, voix fournie ou non.

## Étape 2 — Script (Claude, validation utilisateur = choix artistique majeur)
- Hook 0–3 s ; 1 idée/phrase ; retournement au milieu ; punchline ; CTA optionnel.
- ~2,5 mots/s. Liste des mots-clés et d'une métaphore par phrase.

## Étape 3 — DA + storyboard (Claude)
Palette, police, grammaire visuelle, puis storyboard :

| TC | Durée | Visuel / composition | Animation | Transition | Texte | SFX |
|---|---|---|---|---|---|---|
| 0:00.0 | 1,2 s | … | A5 icon pop | cut | … | pop + sub_hit |

## Étape 4 — Voix → timings
Utilisateur enregistre `voice.wav` → `python3 tools/transcribe_words.py audio/voice.wav words.json --model small --lang fr --upper`
(ou `--script` si le modèle n'est pas accessible). Marquer les accents.

## Étape 5 — Plan d'animation
Pour chaque animation : propriété · valeur initiale → finale · début (frame) · durée · easing ·
ancre · overshoot · synchro son. (Voir catalogue A1–A16.)

## Étape 6 — Production
1. Images fixes clés (`npx remotion still`) → validation visuelle.
2. Rendu complet `npx remotion render src/index.ts <Comp> renders/raw.mp4 --props=props.json --crf=16`.
3. 3D éventuelle : Blender headless → séquence → intégrée.

## Étape 7 — Sound design
`tools/sfx_synth.py` (seed propre au projet) → timeline SFX → musique sous licence → mix.

## Étape 8 — Finition & QC
```
tools/finish.sh renders/raw.mp4 renders/final.mp4
python3 tools/qc_check.py renders/final.mp4 --events words.json > renders/qc.txt
```
+ planche visuelle des moments critiques. Corriger → re-rendre jusqu'à QC OK.

## Étape 9 — Livraison
`final.mp4` + `qc.txt` + texte de description/hashtags suggérés + checklist monétisation
(skill `short-form-production`, §7).
