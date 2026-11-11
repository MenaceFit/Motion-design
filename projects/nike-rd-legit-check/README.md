# Legit check — Zip Nike Running Division (authentique vs 1.1)

Vidéo verticale 42 s montée sur la voix off de l'utilisateur. Médias : 3 photos (2 références
de contrefaçon, 1 authentique) + 3 clips 8K de l'authentique (poitrine, étiquette du col, manche).

Rebuild :
```bash
# médias préparés dans templates/remotion-kinetic/public/projects/legit/ (non versionnés)
python3 tools/transcribe_words.py assets/voice.wav words.json --model small --lang fr
python3 projects/nike-rd-legit-check/build_captions.py      # corrections Whisper → captions.json
npx remotion render src/index.ts LegitCheck out.mp4 --props=../../projects/nike-rd-legit-check/props.json --muted
python3 tools/mix_audio.py … --sfx audio/sfx_timeline.json  # puis limiteur true peak, finish.sh, qc_check.py
```
Timings des plans : `props.json → T` (secondes, calés sur words.json).
