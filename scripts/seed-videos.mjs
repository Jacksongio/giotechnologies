import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const VIDEOS_DIR = path.join(PROJECT_ROOT, "videos");
const TMP_ARGS = path.join(__dirname, ".tmp-args.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function convexRun(fnName, args) {
  fs.writeFileSync(TMP_ARGS, JSON.stringify(args));
  try {
    const result = execSync(
      `npx convex run "${fnName}" "$(cat ${TMP_ARGS})"`,
      { encoding: "utf-8", cwd: PROJECT_ROOT, shell: "/bin/bash" },
    );
    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1].trim();
    try { return JSON.parse(lastLine); } catch { return lastLine; }
  } finally {
    try { fs.unlinkSync(TMP_ARGS); } catch {}
  }
}

/** Turn a filename into a human-readable title. */
function filenameToTitle(filename) {
  let name = filename
    .replace(/\.mp4$/i, "")          // drop extension
    .replace(/\s*\(\d+p\)/g, "")     // drop (720p), (1080p), (540p) etc.
    .replace(/\s*\(\d+\)/g, "")      // drop (1), (2) duplicate markers
    .replace(/_v\d+$/i, "")          // drop _v1 version suffix
    .replace(/_/g, " ")              // underscores -> spaces
    .trim();

  // Title-case each word
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());

  // Fix common contractions and small words
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
    .replace(/\bIs\b/g, "is")
    .replace(/\b&\b/g, "&");

  // First letter should be uppercase
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Fix possessives that got mangled
  name = name.replace(/'S\b/g, "'s");

  return name;
}

/** Try to extract a year from the filename or title. */
function extractYear(filename) {
  // Match 4-digit year (1990-2029)
  const match = filename.match(/\b(19\d{2}|20[0-2]\d)\b/);
  return match ? match[1] : "";
}

/** Categorize into a collection based on keywords in filename. */
function categorize(filename) {
  const lower = filename.toLowerCase();

  if (/christmas|xmas|thanksgiving|easter|holiday/.test(lower))
    return "Holidays";
  if (/birthday|bday|turns?\s?\d/.test(lower))
    return "Birthdays";
  if (/wedding|memorial/.test(lower))
    return "Celebrations";
  if (/hawaii|florida|cruise|orlando|california|trip|travel|mediterranean|north captiva/.test(lower))
    return "Trips";
  if (/dance|dancing|dances/.test(lower))
    return "Fun Moments";
  if (/fishing|tubing|swim|soccer|baseball|volleyball|wrestling|paddl/.test(lower))
    return "Sports & Outdoors";

  return "Family Memories";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // List all mp4 files, skip duplicates ((1), (2) suffixed files)
  const allFiles = fs.readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .filter((f) => !f.match(/\(\d+\)\.mp4$/))
    .sort();

  console.log(`Found ${allFiles.length} unique videos to seed.\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const filename = allFiles[i];
    const filePath = path.join(VIDEOS_DIR, filename);
    const fileSize = fs.statSync(filePath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(0);
    const title = filenameToTitle(filename);
    const year = extractYear(filename);
    const collection = categorize(filename);

    console.log(`[${i + 1}/${allFiles.length}] "${title}" (${sizeMB} MB)`);
    console.log(`  Collection: ${collection}${year ? `, Year: ${year}` : ""}`);

    try {
      // Get upload URL
      const uploadUrl = convexRun("seed:generateUploadUrl", {});

      // Upload video file
      console.log(`  Uploading...`);
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
      console.log(`  Stored: ${storageId}`);

      // Create video record
      const args = {
        title,
        description: "",
        collection,
        year,
        duration: "",
        storageId,
      };
      convexRun("seed:insertVideo", args);
      console.log(`  Done!`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      failed++;
    }

    console.log();
  }

  console.log("=".repeat(50));
  console.log(`Seeding complete: ${success} uploaded, ${failed} failed out of ${allFiles.length} total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
