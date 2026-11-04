#!/usr/bin/env bash
# Rendu complet d'un épisode Teddy en une commande (nouvelle session comprise) :
# dépendances → voix (ElevenLabs si ELEVENLABS_API_KEY + réseau, sinon repli) → musique/SFX/mix →
# rendu 60 fps → finition -14 LUFS → QC. Usage : tools/teddy_render.sh projects/teddy-j30/ep01/full.json
set -euo pipefail
EP="$1"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TPL="$ROOT/templates/remotion-kinetic"
SLUG=$(python3 -c "import json,sys;print(json.load(open('$EP'))['slug'])")
COMP=$(python3 -c "import json,sys;print(json.load(open('$EP')).get('composition','TeddyEpFull'))")
OUT="$ROOT/renders/$SLUG"; mkdir -p "$OUT"
export CHROMIUM_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
# 1. dépendances (idempotent)
command -v pico2wave >/dev/null || (apt-get update -qq && apt-get install -y -qq libttspico-utils sox libsox-fmt-all fonts-noto-color-emoji >/dev/null)
python3 -c "import librosa, pedalboard, soundfile" 2>/dev/null || pip install -q librosa pedalboard soundfile opencv-python-headless scenedetect matplotlib
[ -d "$TPL/node_modules" ] || (cd "$TPL" && npm install --no-audit --no-fund)
[ -f "$TPL/public/sfxlib/catalog.json" ] || (cd "$TPL" && node scripts/build_sfx_library.mjs)
# 2. audio + données
python3 "$ROOT/tools/teddy_build.py" "$EP" --out "$OUT"
echo "Voix : $(python3 -c "import json;r=json.load(open('$OUT/voice_report.json'));print(sorted({x['engine'] for x in r}))")"
# 3. rendu
cd "$TPL" && npx remotion render src/index.ts "$COMP" "$OUT/raw.mp4" --props="$OUT/episode.json" --crf=16 --concurrency=4 --log=error
# 4. finition + QC
"$ROOT/tools/finish.sh" "$OUT/raw.mp4" "$OUT/$SLUG.mp4"
python3 -c "import json;d=json.load(open('$OUT/episode.json'));json.dump([{'start':c['start']} for c in d['caps']],open('$OUT/events.json','w'))"
python3 "$ROOT/tools/qc_check.py" "$OUT/$SLUG.mp4" --fps 60 --events "$OUT/events.json" | tee "$OUT/qc.txt"
echo "✔ $OUT/$SLUG.mp4"
