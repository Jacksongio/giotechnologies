import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const VIDEOS_DIR = path.join(PROJECT_ROOT, "videos");
const THUMBS_DIR = path.join(PROJECT_ROOT, "videos", "thumbnails");
const TMP_ARGS = path.join(__dirname, ".tmp-args.json");

// Ensure thumbnails directory exists
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

function filenameToTitle(filename) {
  let name = filename
    .replace(/\.mp4$/i, "")
    .replace(/\s*\(\d+p\)/g, "")
    .replace(/\s*\(\d+\)/g, "")
    .replace(/_v\d+$/i, "")
    .replace(/_/g, " ")
    .trim();

  name = name.replace(/\b\w/g, (c) => c.toUpperCase());
  name = name
    .replace(/\bAnd\b/g, "and")
    .replace(/\bAt\b/g, "at")
    .replace(/\bIn\b/g, "in")
    .replace(/\bOn\b/g, "on")
    .replace(/\bOf\b/g, "of")
    .replace(/\bTo\b/g, "to")
    .replace(/\bThe\b/g, "the")
    .replace(/\bWith\b/g, "with")
    .replace(/\bVs\b/g, "vs")
    .replace(/\bIs\b/g, "is");
  name = name.charAt(0).toUpperCase() + name.slice(1);
  name = name.replace(/'S\b/g, "'s");
  return name;
}

async function main() {
  // Get list of videos without thumbnails
  console.log("Fetching videos without thumbnails...");
  const videosWithoutThumbs = convexRun(
    "seed:listVideosWithoutThumbnails",
    {},
  );
  console.log(
    `Found ${videosWithoutThumbs.length} videos without thumbnails.\n`,
  );

  if (videosWithoutThumbs.length === 0) {
    console.log("All videos already have thumbnails!");
    return;
  }

  // Build a map of title -> local video file path
  const allFiles = fs.readdirSync(VIDEOS_DIR).filter((f) => f.endsWith(".mp4"));
  const titleToFile = new Map();
  for (const filename of allFiles) {
    const title = filenameToTitle(filename);
    // Prefer the first match (skip duplicates)
    if (!titleToFile.has(title)) {
      titleToFile.set(title, path.join(VIDEOS_DIR, filename));
    }
  }

  const titlesNeeded = new Set(videosWithoutThumbs.map((v) => v.title));

  let success = 0;
  let skipped = 0;
  let failed = 0;
  let i = 0;

  for (const { title } of videosWithoutThumbs) {
    i++;
    const videoPath = titleToFile.get(title);

    if (!videoPath) {
      console.log(`[${i}/${videosWithoutThumbs.length}] SKIP "${title}" - no local file found`);
      skipped++;
      continue;
    }

    const thumbFilename = title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_") + ".jpg";
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);

    console.log(`[${i}/${videosWithoutThumbs.length}] "${title}"`);

    try {
      // Extract thumbnail at 10 seconds (or 1 second for short videos)
      if (!fs.existsSync(thumbPath)) {
        console.log(`  Extracting thumbnail...`);
        try {
          execSync(
            `ffmpeg -y -ss 10 -i "${videoPath}" -vframes 1 -vf "scale=640:-2" -q:v 2 "${thumbPath}" 2>/dev/null`,
            { cwd: PROJECT_ROOT },
          );
        } catch {
          // Try at 1 second if 10s fails (video might be shorter)
          execSync(
            `ffmpeg -y -ss 1 -i "${videoPath}" -vframes 1 -vf "scale=640:-2" -q:v 2 "${thumbPath}" 2>/dev/null`,
            { cwd: PROJECT_ROOT },
          );
        }
      } else {
        console.log(`  Thumbnail already extracted`);
      }

      // Upload thumbnail to Convex storage
      console.log(`  Uploading thumbnail...`);
      const uploadUrl = convexRun("seed:generateUploadUrl", {});
      const thumbBytes = fs.readFileSync(thumbPath);
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: thumbBytes,
      });

      if (!uploadResp.ok) {
        throw new Error(`Upload failed: ${uploadResp.status} ${uploadResp.statusText}`);
      }

      const { storageId } = await uploadResp.json();

      // Link thumbnail to video record
      convexRun("seed:setThumbnail", { title, thumbnailStorageId: storageId });
      console.log(`  Done!`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      failed++;
    }
    console.log();
  }

  console.log("=".repeat(50));
  console.log(
    `Thumbnails: ${success} uploaded, ${skipped} skipped, ${failed} failed out of ${videosWithoutThumbs.length} total.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
