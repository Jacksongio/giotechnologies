import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  videos: defineTable({
    title: v.string(),
    description: v.string(),
    collection: v.string(),
    year: v.string(),
    duration: v.string(),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    featured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  })
    .index("by_collection", ["collection"])
    .index("by_featured", ["featured"]),
});
