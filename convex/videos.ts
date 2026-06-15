import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { r2 } from "./r2";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const videos = await ctx.db
      .query("videos")
      .order("desc")
      .take(200);

    // Newest-first by default; videos with a higher `order` sink to the bottom.
    videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return await Promise.all(
      videos.map(async (video) => {
        let videoUrl: string | null = null;
        if (video.r2Key) {
          videoUrl = await r2.getUrl(video.r2Key);
        } else if (video.storageId) {
          videoUrl = await ctx.storage.getUrl(video.storageId);
        }
        return {
          ...video,
          thumbnailUrl: video.thumbnailStorageId
            ? await ctx.storage.getUrl(video.thumbnailStorageId)
            : null,
          videoUrl,
        };
      }),
    );
  },
});

export const listByCollection = query({
  args: { collection: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const videos = await ctx.db
      .query("videos")
      .withIndex("by_collection", (q) => q.eq("collection", args.collection))
      .order("desc")
      .take(200);

    // Newest-first by default; videos with a higher `order` sink to the bottom.
    videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return await Promise.all(
      videos.map(async (video) => {
        let videoUrl: string | null = null;
        if (video.r2Key) {
          videoUrl = await r2.getUrl(video.r2Key);
        } else if (video.storageId) {
          videoUrl = await ctx.storage.getUrl(video.storageId);
        }
        return {
          ...video,
          thumbnailUrl: video.thumbnailStorageId
            ? await ctx.storage.getUrl(video.thumbnailStorageId)
            : null,
          videoUrl,
        };
      }),
    );
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const featured = await ctx.db
      .query("videos")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .first();

    if (!featured) return null;

    let videoUrl: string | null = null;
    if (featured.r2Key) {
      videoUrl = await r2.getUrl(featured.r2Key);
    } else if (featured.storageId) {
      videoUrl = await ctx.storage.getUrl(featured.storageId);
    }

    return {
      ...featured,
      thumbnailUrl: featured.thumbnailStorageId
        ? await ctx.storage.getUrl(featured.thumbnailStorageId)
        : null,
      videoUrl,
    };
  },
});

export const getCollections = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const videos = await ctx.db.query("videos").take(200);
    const collectionCounts: Record<string, number> = {};
    for (const video of videos) {
      collectionCounts[video.collection] =
        (collectionCounts[video.collection] ?? 0) + 1;
    }
    return Object.entries(collectionCounts).map(([name, count]) => ({
      name,
      count,
    }));
  },
});

export const create = mutation({
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("videos", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    collection: v.optional(v.string()),
    year: v.optional(v.string()),
    duration: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});
