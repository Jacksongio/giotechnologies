import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Thin local uploader. All metadata derivation (title/year/collection),
// dedup, and DB insertion live in the Convex `seed:importVideo` mutation.
// This script just reads file bytes from new_videos/, uploads them to Convex
// storage, calls importVideo, then extracts + uploads a thumbnail.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const NEW_VIDEOS_DIR = path.join(PROJECT_ROOT, "new_videos");
const THUMBS_DIR = path.join(PROJECT_ROOT, "videos", "thumbnails");
const TMP_ARGS = path.join(__dirname, ".tmp-args.json");

if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

function convexRun(fnName, args) {
  fs.writeFileSync(TMP_ARGS, JSON.stringify(args));
  try {
    const result = execSync(
      `npx convex run "${fnName}" "$(cat ${TMP_ARGS})"`,
      { encoding: "utf-8", cwd: PROJECT_ROOT, shell: "/bin/bash" },
    );
    const output = result.trim();
    try { return JSON.parse(output); } catch {}
    const lines = output.split("\n");
    const lastLine = lines[lines.length - 1].trim();
    try { return JSON.parse(lastLine); } catch { return lastLine; }
  } finally {
    try { fs.unlinkSync(TMP_ARGS); } catch {}
  }
}

async function generateThumbnail(videoPath, title) {
  const thumbFilename =
    title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_") + ".jpg";
  const thumbPath = path.join(THUMBS_DIR, thumbFilename);

  if (!fs.existsSync(thumbPath)) {
    try {
      execSync(
        `ffmpeg -y -ss 10 -i "${videoPath}" -vframes 1 -vf "scale=640:-2" -q:v 2 "${thumbPath}" 2>/dev/null`,
        { cwd: PROJECT_ROOT },
      );
    } catch {
      execSync(
        `ffmpeg -y -ss 1 -i "${videoPath}" -vframes 1 -vf "scale=640:-2" -q:v 2 "${thumbPath}" 2>/dev/null`,
        { cwd: PROJECT_ROOT },
      );
    }
  }

  const uploadUrl = convexRun("seed:generateUploadUrl", {});
  const thumbBytes = fs.readFileSync(thumbPath);
  const uploadResp = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: thumbBytes,
  });
  if (!uploadResp.ok) {
    throw new Error(`Thumbnail upload failed: ${uploadResp.status} ${uploadResp.statusText}`);
  }
  const { storageId } = await uploadResp.json();
  convexRun("seed:setThumbnail", { title, thumbnailStorageId: storageId });
}

async function main() {
  if (!fs.existsSync(NEW_VIDEOS_DIR)) {
    console.error(`Directory not found: ${NEW_VIDEOS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(NEW_VIDEOS_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .filter((f) => !f.match(/\(\d+\)\.mp4$/))
    .sort();

  console.log(`Found ${files.length} videos in new_videos/ to import.\n`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(NEW_VIDEOS_DIR, filename);
    const sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(0);

    console.log(`[${i + 1}/${files.length}] ${filename} (${sizeMB} MB)`);

    try {
      // Upload the file bytes to Convex storage.
      console.log("  Uploading...");
      const uploadUrl = convexRun("seed:generateUploadUrl", {});
      const fileBytes = fs.readFileSync(filePath);
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "video/mp4" },
        body: fileBytes,
      });
      if (!uploadResp.ok) {
        throw new Error(`Upload failed: ${uploadResp.status} ${uploadResp.statusText}`);
      }
      const { storageId } = await uploadResp.json();

      // Derive metadata + dedup + insert, all in Convex.
      const result = convexRun("seed:importVideo", { filename, storageId });
      console.log(`  -> "${result.title}" [${result.collection}${result.year ? `, ${result.year}` : ""}]`);

      if (result.skipped) {
        console.log("  Already imported, skipping thumbnail.\n");
        skipped++;
        continue;
      }

      console.log("  Generating thumbnail...");
      await generateThumbnail(filePath, result.title);
      console.log("  Done!\n");
      imported++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}\n`);
      failed++;
    }
  }

  console.log("=".repeat(50));
  console.log(`Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed out of ${files.length} total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
