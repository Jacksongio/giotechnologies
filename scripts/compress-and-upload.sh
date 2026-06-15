#!/bin/bash
set -e

VIDEOS_DIR="/home/jacksongio/dev/giotechnologies/videos"
COMPRESSED_DIR="/home/jacksongio/dev/giotechnologies/videos/compressed"
mkdir -p "$COMPRESSED_DIR"

# Find all >500MB non-duplicate mp4 files
mapfile -t FILES < <(find "$VIDEOS_DIR" -maxdepth 1 -name '*.mp4' -size +500M | grep -v -E '\([0-9]+\)\.mp4$' | sort)

TOTAL=${#FILES[@]}
echo "Compressing $TOTAL oversized videos with ffmpeg (crf 26)..."
echo ""

COUNT=0
for FILE in "${FILES[@]}"; do
  COUNT=$((COUNT + 1))
  BASENAME=$(basename "$FILE")
  OUTPUT="$COMPRESSED_DIR/$BASENAME"
  SIZE_MB=$(( $(stat --format=%s "$FILE") / 1024 / 1024 ))

  echo "[$COUNT/$TOTAL] $BASENAME (${SIZE_MB}MB)"

  if [ -f "$OUTPUT" ]; then
    OUTSIZE_MB=$(( $(stat --format=%s "$OUTPUT") / 1024 / 1024 ))
    echo "  Already compressed (${OUTSIZE_MB}MB), skipping."
    echo ""
    continue
  fi

  ffmpeg -y -i "$FILE" \
    -c:v libx264 -crf 26 -preset medium \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "$OUTPUT" 2>/dev/null

  OUTSIZE_MB=$(( $(stat --format=%s "$OUTPUT") / 1024 / 1024 ))
  echo "  Compressed: ${SIZE_MB}MB -> ${OUTSIZE_MB}MB"
  echo ""
done

echo "Compression complete! Files saved to $COMPRESSED_DIR"
