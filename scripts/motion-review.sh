#!/usr/bin/env bash
# usage: scripts/motion-review.sh video.mp4   (then LOOK at tmp/review/sheet.png)
set -euo pipefail
f="$1"; out=tmp/review; mkdir -p "$out"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
echo "duration_s: $dur"
ffmpeg -v error -y -i "$f" -vf "fps=1/1.5,scale=180:-1,tile=8x3" -frames:v 1 "$out/sheet.png"
cuts=$(ffmpeg -i "$f" -vf "select='gt(scene,0.15)',showinfo" -an -f null - 2>&1 | grep -c "pts_time" || true)
echo "visual changes (scene score > 0.15): $cuts  (target: at least duration/3)"
frozen=$(ffmpeg -i "$f" -vf "freezedetect=n=-30dB:d=1.5" -an -f null - 2>&1 | grep -c "freeze_start" || true)
echo "mostly-static segments >= 1.5s: $frozen  (target: 0)"
echo "contact sheet: $out/sheet.png"
