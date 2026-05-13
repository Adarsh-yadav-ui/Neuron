import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const saveMessage = mutation({
  args: {
    notebookId: v.id("notebooks"),
    question: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("messages", {
      notebookId: args.notebookId,
      userId: user._id,
      question: args.question,
      answer: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_notebook_time", (q) => q.eq("notebookId", args.notebookId))
      .order("asc")
      .collect();
  },
});

export const clearMessages = mutation({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
