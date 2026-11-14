# Bas Nike Running Division — 1:1 vs authentique (quiz pixel)
Style : `references/visual-styles/pixel-legit-quiz.md` (ref09/ref10).
1. `python3 crop_assets.py <dossier photos>` → cartes 3:4 (photos fournies par l'utilisateur)
2. `python3 sprite.py` → personnage pixel (13 poses) ; copier `assets/*` dans `templates/remotion-kinetic/public/nrd/`
3. Rendu : `npx remotion render src/index.ts LegitCheck ../../renders/nrd_video.mp4`
4. Audio : `python3 projects/nrd-legit-check/sfx_plan.py` puis `tools/mix_audio.py` (voix `audio/voice.mp3`, musique hype 118 BPM)
5. Mux + `tools/finish.sh` + `tools/qc_check.py --events audio/words.json`
