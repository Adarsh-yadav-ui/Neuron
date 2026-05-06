// convex/notebooks.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// * ─── MUTATIONS ───────────────────────────────────────────

export const createNotebook = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const now = Date.now();

    const notebookId = await ctx.db.insert("notebooks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    return notebookId;
  },
});

export const updateNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    await ctx.db.patch(args.notebookId, {
      ...(args.title && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });
  },
});

export const deleteNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    // Delete all sources belonging to this notebook
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();

    for (const source of sources) {
      // Delete file from Convex Storage if exists
      if (source.storageId) {
        await ctx.storage.delete(source.storageId);
      }
      await ctx.db.delete(source._id);
    }

    // Delete all messages for this notebook
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the note for this notebook
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();

    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    await ctx.db.delete(args.notebookId);
  },
});

// * ─── QUERIES ─────────────────────────────────────────────

// All notebooks for logged-in user (dashboard)
export const getUserNotebooks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("notebooks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Single notebook by ID
export const getNotebook = query({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id) return null;

    return notebook;
  },
});

// Notebook with source count (for dashboard cards)
export const getUserNotebooksWithCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const notebooks = await ctx.db
      .query("notebooks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      notebooks.map(async (notebook) => {
        const sources = await ctx.db
          .query("sources")
          .withIndex("by_notebook", (q) => q.eq("notebookId", notebook._id))
          .collect();

        return {
          ...notebook,
          sourceCount: sources.length,
        };
      })
    );
  },
});