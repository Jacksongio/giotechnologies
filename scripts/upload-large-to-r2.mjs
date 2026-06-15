import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const VIDEOS_DIR = path.join(PROJECT_ROOT, "videos");
const TMP_ARGS = path.join(__dirname, ".tmp-args.json");

// Minimum file size to upload via R2 (500MB)
const MIN_SIZE_BYTES = 500 * 1024 * 1024;

function convexRun(fnName, args) {
  fs.writeFileSync(TMP_ARGS, JSON.stringify(args));
  try {
    const result = execSync(
      `npx convex run "${fnName}" "$(cat ${TMP_ARGS})"`,
      { encoding: "utf-8", cwd: PROJECT_ROOT, shell: "/bin/bash" },
    );
    const output = result.trim();
    // Try parsing the full output as JSON first (handles multi-line JSON)
    try { return JSON.parse(output); } catch {}
    // Fall back to parsing just the last line
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

function extractYear(filename) {
  const match = filename.match(/\b(19\d{2}|20[0-2]\d)\b/);
  return match ? match[1] : "";
}

function categorize(filename) {
  const lower = filename.toLowerCase();
  if (/christmas|xmas|thanksgiving|easter|holiday/.test(lower)) return "Holidays";
  if (/birthday|bday|turns?\s?\d/.test(lower)) return "Birthdays";
  if (/wedding|memorial/.test(lower)) return "Celebrations";
  if (/hawaii|florida|cruise|orlando|california|trip|travel|mediterranean|north captiva/.test(lower)) return "Trips";
  if (/dance|dancing|dances/.test(lower)) return "Fun Moments";
  if (/fishing|tubing|swim|soccer|baseball|volleyball|wrestling|paddl/.test(lower)) return "Sports & Outdoors";
  return "Family Memories";
}

async function main() {
  // Find all mp4 files over 500MB, skip duplicates
  const allFiles = fs.readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .filter((f) => !f.match(/\(\d+\)\.mp4$/))
    .filter((f) => {
      const filePath = path.join(VIDEOS_DIR, f);
      return fs.statSync(filePath).size >= MIN_SIZE_BYTES;
    })
    .sort();

  console.log(`Found ${allFiles.length} large videos (>500MB) to upload to R2.\n`);

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
      // Get signed R2 upload URL
      const { key, url } = convexRun("seedR2:generateR2UploadUrl", {});
      console.log(`  R2 key: ${key}`);

      // Upload file directly to R2
      console.log(`  Uploading to R2...`);
      const fileBytes = fs.readFileSync(filePath);
      const uploadResp = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "video/mp4" },
        body: fileBytes,
      });

      if (!uploadResp.ok) {
        throw new Error(`R2 upload failed: ${uploadResp.status} ${uploadResp.statusText}`);
      }

      console.log(`  Uploaded to R2 successfully`);

      // Sync metadata back to Convex
      convexRun("seedR2:syncR2Metadata", { key });

      // Create video record with r2Key
      const args = {
        title,
        description: "",
        collection,
        year,
        duration: "",
        r2Key: key,
      };
      convexRun("seed:insertVideo", args);
      console.log(`  Done!\n`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}\n`);
      failed++;
    }
  }

  console.log("=".repeat(50));
  console.log(`Upload complete: ${success} uploaded, ${failed} failed out of ${allFiles.length} total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
