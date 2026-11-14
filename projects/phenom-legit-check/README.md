# Bas Nike Phenom Elite — 1:1 vs authentique (quiz pixel, v2)
Même pipeline que `projects/nrd-legit-check` ; composition `LegitCheckPhenom` (config `phenomCfg` dans `src/nrd/configs.ts`).
1. `python3 crop_assets.py <video_utilisateur.mp4>` puis copier `assets/*` dans `templates/remotion-kinetic/public/phenom/`
2. Voix : `audio/voice.mp3` (script : `script_elevenlabs.txt`) → timings `audio/words.json` (Whisper small)
3. `npx remotion render src/index.ts LegitCheckPhenom ../../renders/phenom_video.mp4`
4. `python3 projects/phenom-legit-check/sfx_plan.py`, `tools/music_gen.py --mood hype --bpm 120`, `tools/mix_audio.py`, mux, `tools/finish.sh`, `tools/qc_check.py`
