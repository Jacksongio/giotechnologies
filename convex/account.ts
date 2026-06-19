import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      image: user.image ?? null,
      _creationTime: user._creationTime,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const fields: Record<string, string> = {};
    if (args.name !== undefined) fields.name = args.name;
    if (args.phone !== undefined) fields.phone = args.phone;

    await ctx.db.patch(userId, fields);
  },
});
