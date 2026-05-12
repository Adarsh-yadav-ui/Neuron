// convex/sourceActions.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getStorageUrl = action({
  args: {
    sourceId: v.id("sources"),
  },
  handler: async (ctx, args) => {
    const source = (await ctx.runQuery(api.sources.getSource, {
      sourceId: args.sourceId,
    })) as any;
    if (!source) throw new Error("Source not found");
    if (!source.storageId) return null;
    return await ctx.storage.getUrl(source.storageId);
  },
});
