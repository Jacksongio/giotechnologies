import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  familyCards: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    occasion: v.string(),
    message: v.string(),
    isRead: v.boolean(),
  })
    .index("by_recipientId", ["recipientId"])
    .index("by_senderId", ["senderId"])
    .index("by_recipientId_and_isRead", ["recipientId", "isRead"]),

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
