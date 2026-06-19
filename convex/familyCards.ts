import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listReceived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cards = await ctx.db
      .query("familyCards")
      .withIndex("by_recipientId", (q) => q.eq("recipientId", userId))
      .order("desc")
      .take(100);

    return await Promise.all(
      cards.map(async (card) => {
        const sender = await ctx.db.get(card.senderId);
        return {
          ...card,
          senderName: sender?.name ?? sender?.email ?? "Family Member",
        };
      }),
    );
  },
});

export const listSent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cards = await ctx.db
      .query("familyCards")
      .withIndex("by_senderId", (q) => q.eq("senderId", userId))
      .order("desc")
      .take(100);

    return await Promise.all(
      cards.map(async (card) => {
        const recipient = await ctx.db.get(card.recipientId);
        return {
          ...card,
          recipientName:
            recipient?.name ?? recipient?.email ?? "Family Member",
        };
      }),
    );
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("familyCards")
      .withIndex("by_recipientId_and_isRead", (q) =>
        q.eq("recipientId", userId).eq("isRead", false),
      )
      .take(100);

    return unread.length;
  },
});

export const send = mutation({
  args: {
    recipientId: v.id("users"),
    occasion: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.recipientId === userId) {
      throw new Error("Cannot send a card to yourself");
    }

    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) throw new Error("Recipient not found");

    return await ctx.db.insert("familyCards", {
      senderId: userId,
      recipientId: args.recipientId,
      occasion: args.occasion,
      message: args.message,
      isRead: false,
    });
  },
});

export const markAsRead = mutation({
  args: { cardId: v.id("familyCards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    if (card.recipientId !== userId) {
      throw new Error("Not authorized");
    }

    if (!card.isRead) {
      await ctx.db.patch(args.cardId, { isRead: true });
    }
  },
});

export const listFamilyMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const users = await ctx.db.query("users").take(50);

    return users
      .filter((u) => u._id !== userId)
      .map((u) => ({
        _id: u._id,
        name: u.name ?? null,
        email: u.email ?? null,
      }));
  },
});
