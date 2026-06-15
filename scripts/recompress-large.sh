#!/bin/bash
# Re-compress videos in videos/compressed/ that are still over 450MB
# Uses CRF 32 for more aggressive compression while keeping acceptable quality

COMPRESSED_DIR="$(dirname "$0")/../videos/compressed"
TARGET_SIZE_KB=$((450 * 1024))  # 450MB in KB

echo "Scanning for compressed videos still over 450MB..."
echo ""

count=0
processed=0
failed=0

while IFS= read -r -d '' file; do
    size_kb=$(du -k "$file" | cut -f1)
    size_mb=$((size_kb / 1024))

    if [ "$size_kb" -gt "$TARGET_SIZE_KB" ]; then
        count=$((count + 1))
        basename=$(basename "$file")
        echo "[$count] Re-compressing: $basename (${size_mb}MB)"

        tmpfile="${file%.mp4}_recomp.mp4"

        if ffmpeg -y -i "$file" \
            -c:v libx264 -crf 32 -preset slow \
            -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
            -c:a aac -b:a 96k \
            "$tmpfile" 2>/dev/null; then

            new_size_kb=$(du -k "$tmpfile" | cut -f1)
            new_size_mb=$((new_size_kb / 1024))
            echo "  Compressed: ${size_mb}MB -> ${new_size_mb}MB"

            # Replace original with recompressed version
            mv "$tmpfile" "$file"
            processed=$((processed + 1))
        else
            echo "  FAILED to compress $basename"
            rm -f "$tmpfile"
            failed=$((failed + 1))
        fi
        echo ""
    fi
done < <(find "$COMPRESSED_DIR" -name "*.mp4" -print0)

echo "=========================================="
echo "Done: $processed re-compressed, $failed failed out of $count over-size files."
