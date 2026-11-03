#!/usr/bin/env bash
# Finalisation d'un export pour TikTok / Reels / Shorts.
#  - normalisation loudness EBU R128 en 2 passes : -14 LUFS intégré, true peak -1.5 dBTP (marge pour l’encodage AAC)
#  - H.264 High, yuv420p, CRF 17, GOP 2 s, +faststart (lecture immédiate en streaming)
#  - AAC 48 kHz 320 kb/s
# Usage : tools/finish.sh input.mp4 output.mp4 [lufs=-14]
set -euo pipefail
IN="$1"; OUT="$2"; LUFS="${3:--14}"
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$IN" | awk -F/ '{printf "%d", $1/$2}')
# Passe 1 : mesure
M=$(ffmpeg -hide_banner -i "$IN" -af "loudnorm=I=${LUFS}:TP=-1.5:LRA=11:print_format=json" -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
# Passe 2 : correction linéaire avec les valeurs mesurées
ffmpeg -hide_banner -v error -y -i "$IN" \
  -af "loudnorm=I=${LUFS}:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 17 -preset slow -g $((FPS*2)) \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$OUT"
echo "OK → $OUT"
