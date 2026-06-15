import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// ---------------------------------------------------------------------------
// Metadata derivation helpers (shared by the import pipeline)
// ---------------------------------------------------------------------------

/** Turn a filename into a human-readable title. */
function filenameToTitle(filename: string): string {
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

/** Try to extract a year from the filename. */
function extractYear(filename: string): string {
  const match = filename.match(/\b(19\d{2}|20[0-2]\d)\b/);
  return match ? match[1] : "";
}

/** Categorize into a collection based on keywords in the filename. */
function categorize(filename: string): string {
  const lower = filename.toLowerCase();
  if (/christmas|xmas|thanksgiving|easter|holiday/.test(lower)) return "Holidays";
  if (/birthday|bday|turns?\s?\d/.test(lower)) return "Birthdays";
  if (/wedding|memorial/.test(lower)) return "Celebrations";
  if (/alaska|hawaii|florida|cruise|orlando|california|trip|travel|mediterranean|north captiva/.test(lower)) return "Trips";
  if (/dance|dancing|dances/.test(lower)) return "Fun Moments";
  if (/fishing|tubing|swim|soccer|baseball|volleyball|wrestling|paddl/.test(lower)) return "Sports & Outdoors";
  return "Family Memories";
}

/**
 * Import a single video: derive its title/year/collection from the filename,
 * skip it if a video with the same title already exists, otherwise insert a
 * new record. The file bytes must already be uploaded to Convex storage (pass
 * `storageId`) or R2 (pass `r2Key`) before calling this.
 */
export const importVideo = internalMutation({
  args: {
    filename: v.string(),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = filenameToTitle(args.filename);
    const collection = categorize(args.filename);
    const year = extractYear(args.filename);

    const existing = await ctx.db.query("videos").take(500);
    const duplicate = existing.find((video) => video.title === title);
    if (duplicate) {
      return { videoId: duplicate._id, title, collection, year, skipped: true };
    }

    const videoId = await ctx.db.insert("videos", {
      title,
      description: "",
      collection,
      year,
      duration: "",
      storageId: args.storageId,
      r2Key: args.r2Key,
    });
    return { videoId, title, collection, year, skipped: false };
  },
});

export const insertVideo = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    collection: v.string(),
    year: v.string(),
    duration: v.string(),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("videos", args);
  },
});

export const patchVideos = internalMutation({
  args: {
    patches: v.array(
      v.object({
        id: v.id("videos"),
        title: v.optional(v.string()),
        order: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const patch of args.patches) {
      const { id, ...fields } = patch;
      await ctx.db.patch(id, fields);
    }
    return args.patches.length;
  },
});

export const generateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const clearVideos = internalMutation({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").take(200);
    for (const video of videos) {
      if (video.storageId) await ctx.storage.delete(video.storageId);
      if (video.thumbnailStorageId) await ctx.storage.delete(video.thumbnailStorageId);
      await ctx.db.delete(video._id);
    }
    return videos.length;
  },
});

export const countVideos = internalQuery({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").take(200);
    return videos.length;
  },
});

export const setThumbnail = internalMutation({
  args: {
    title: v.string(),
    thumbnailStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db.query("videos").take(200);
    const video = videos.find((v) => v.title === args.title);
    if (!video) {
      throw new Error(`Video not found: ${args.title}`);
    }
    await ctx.db.patch(video._id, {
      thumbnailStorageId: args.thumbnailStorageId,
    });
    return video._id;
  },
});

export const listAllVideos = internalQuery({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").take(500);
    return videos.map((v) => ({
      _id: v._id,
      title: v.title,
      collection: v.collection,
      order: v.order ?? 0,
    }));
  },
});

export const listVideosWithoutThumbnails = internalQuery({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").take(200);
    return videos
      .filter((v) => !v.thumbnailStorageId)
      .map((v) => ({ _id: v._id, title: v.title }));
  },
});
