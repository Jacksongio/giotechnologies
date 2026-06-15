"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { r2 } from "./r2";

export const generateR2UploadUrl = internalAction({
  args: {},
  handler: async () => {
    return await r2.generateUploadUrl();
  },
});

export const syncR2Metadata = internalAction({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await r2.syncMetadata(ctx as any, args.key);
  },
});
