import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const COMPRESSED_DIR = path.join(PROJECT_ROOT, "videos", "compressed");
const TMP_ARGS = path.join(__dirname, ".tmp-args.json");

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
  const files = fs.readdirSync(COMPRESSED_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .sort();

  console.log(`Found ${files.length} compressed videos to upload.\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(COMPRESSED_DIR, filename);
    const fileSize = fs.statSync(filePath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(0);
    const title = filenameToTitle(filename);
    const year = extractYear(filename);
    const collection = categorize(filename);

    console.log(`[${i + 1}/${files.length}] "${title}" (${sizeMB} MB)`);

    try {
      const uploadUrl = convexRun("seed:generateUploadUrl", {});

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

      const args = {
        title,
        description: "",
        collection,
        year,
        duration: "",
      };
      args.storageId = storageId;
      convexRun("seed:insertVideo", args);
      console.log(`  Done!\n`);
      success++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}\n`);
      failed++;
    }
  }

  console.log("=".repeat(50));
  console.log(`Upload complete: ${success} uploaded, ${failed} failed out of ${files.length} total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
