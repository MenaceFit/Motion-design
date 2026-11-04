# Motion Design Library — instructions pour Claude

Ce dépôt est la **bibliothèque de production motion design** de l'utilisateur. Claude y agit comme
senior motion designer / DA / sound designer : il analyse des références, en extrait des principes,
et produit des vidéos **originales** (jamais des copies) prêtes pour TikTok, Reels et Shorts.

Langue de travail : **français**.

## Règles non négociables
1. Ne jamais prétendre avoir vu, entendu, recherché ou rendu quelque chose qui n'a pas été réellement fait.
   L'audio est analysé par mesures (onsets, spectrogrammes, loudness) : le dire, Claude n'« écoute » pas.
2. Reproduire un **style** = reproduire des principes (rythme, easing, grammaire visuelle, sound design),
   jamais les assets, personnages, textes, logos ou watermarks de la référence.
3. Chaque SFX a une fonction (souligner un mouvement, ponctuer un mot-clé, marquer une transition).
4. Toute vidéo passe `tools/qc_check.py` avant livraison. Un export n'est livré que si le QC est OK.
5. Pas de garantie de monétisation. Contenu original, substantiel, sans assets sous licence douteuse.

## Carte du dépôt
| Dossier | Rôle |
|---|---|
| `.claude/skills/` | Skills réutilisables (chargées automatiquement par Claude Code dans ce dépôt) |
| `tools/` | Scripts testés : analyse de référence, SFX, transcription, QC, finition |
| `templates/remotion-kinetic/` | Projet Remotion (React → MP4) : compositions de styles testées |
| `templates/blender/` | Scènes Blender headless (bpy) |
| `templates/after-effects/` | Expressions + scripts ExtendScript (non testables ici, pas d'AE) |
| `references/` | Analyses des vidéos de référence, fiches de style, catalogues d'animations et de sons |
| `workflows/` | Procédures de bout en bout (analyse, production) |
| `documentation/` | Capacités réelles de l'environnement, limites, sources |
| `changelog.md` | Journal des apprentissages et mises à jour de la bibliothèque |

## Prompt → vidéo (cas le plus fréquent)
Skill `prompt-to-video` : écrire `projects/<slug>/plan.json` puis
`python3 tools/make_video.py projects/<slug>/plan.json --out renders/` (texte 3D 60 fps, voix,
musique, SFX, mix, QC). Règles virales et contraintes de monétisation : `documentation/virality.md`.
Séduction / psychologie au style « Spotlight Noir » (studio sombre, pictos, 1 accent, whip pans) :
skill `spotlight-noir` → `python3 tools/make_noir.py projects/<slug>/plan.json --out renders`.

## Démarrage rapide (conteneur cloud)
```bash
apt-get update && apt-get install -y libttspico-utils espeak-ng sox libsox-fmt-all fonts-noto-color-emoji
pip install opencv-python-headless scenedetect librosa soundfile matplotlib faster-whisper bpy==5.2.3 pedalboard pyloudnorm
cd templates/remotion-kinetic && npm install
export CHROMIUM_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```
- Analyser une référence : `python3 tools/analyze_reference.py video.mp4 out/` puis lire `contact_sheet.jpg`.
- Rendre : `npx remotion render src/index.ts <Composition> out.mp4 --props=props.json`
- Finir + QC : `tools/finish.sh in.mp4 final.mp4 && python3 tools/qc_check.py final.mp4 --events words.json`

## Amélioration continue
À chaque nouvelle référence : analyser → comparer aux fiches `references/visual-styles/` →
mettre à jour la fiche ou en créer une seulement si le style est réellement nouveau →
mettre à jour la skill concernée → consigner dans `changelog.md`.
