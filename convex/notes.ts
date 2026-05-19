import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getNote = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .unique();
  },
});

export const saveNote = mutation({
  args: {
    notebookId: v.id("notebooks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notes", {
        notebookId: args.notebookId,
        userId: user._id,
        content: args.content,
        updatedAt: Date.now(),
      });
    }
  },
});