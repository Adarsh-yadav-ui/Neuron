import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { api } from "./_generated/api";

export const saveChunk = mutation({
  args: {
    notebookId: v.id("notebooks"),
    sourceId: v.id("sources"),
    text: v.string(),
    chunkIndex: v.number(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chunks", {
      notebookId: args.notebookId,
      sourceId: args.sourceId,
      text: args.text,
      chunkIndex: args.chunkIndex,
      embedding: args.embedding,
      createdAt: Date.now(),
    });
  },
});

export const searchChunks = action({
  args: {
    notebookId: v.id("notebooks"),
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("chunks", "by_embedding", {
      vector: args.embedding,
      limit: args.limit ?? 5,
      filter: (q) => q.eq("notebookId", args.notebookId),
    });

    const chunks = await Promise.all(
      results.map(async (r) => {
        const chunk = await ctx.runQuery(api.chunks.getChunk, {
          chunkId: r._id,
        }) as any;
        return chunk;
      }),
    );

    return chunks.filter(Boolean);
  },
});

export const getChunk = query({
  args: { chunkId: v.id("chunks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chunkId);
  },
});
