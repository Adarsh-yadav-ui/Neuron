import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ─── MUTATIONS ───────────────────────────────────────────

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

// PDF / TXT upload
export const createFileSource = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.string(),

    type: v.literal("pdf"),

    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    return await ctx.db.insert("sources", {
      notebookId: args.notebookId,
      userId: user._id,
      title: args.title,
      type: args.type,
      storageId: args.storageId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Text paste — no Inngest needed, directly ready
export const createTextSource = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    return await ctx.db.insert("sources", {
      notebookId: args.notebookId,
      userId: user._id,
      title: args.title,
      type: "text",
      extractedText: args.text,
      status: "ready", // seedha ready — no processing needed
      createdAt: Date.now(),
    });
  },
});

// URL source
export const createUrlSource = mutation({
  args: {
    notebookId: v.id("notebooks"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    return await ctx.db.insert("sources", {
      notebookId: args.notebookId,
      userId: user._id,
      title: args.url,
      type: "url",
      url: args.url,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// YouTube source
export const createYoutubeSource = mutation({
  args: {
    notebookId: v.id("notebooks"),
    url: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== user._id)
      throw new Error("Not found or unauthorized");

    return await ctx.db.insert("sources", {
      notebookId: args.notebookId,
      userId: user._id,
      title: args.title,
      type: "youtube",
      url: args.url,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Called by Inngest after processing
export const updateExtractedText = mutation({
  args: {
    sourceId: v.id("sources"),
    extractedText: v.string(),
    status: v.union(v.literal("ready"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      extractedText: args.extractedText,
      status: args.status,
    });
  },
});

export const updateSourceStatus = mutation({
  args: {
    sourceId: v.id("sources"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, { status: args.status });
  },
});

export const deleteSource = mutation({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const source = await ctx.db.get(args.sourceId);
    if (!source || source.userId !== user._id)
      throw new Error("Not found or unauthorized");

    if (source.storageId) {
      await ctx.storage.delete(source.storageId);
    }

    await ctx.db.delete(args.sourceId);
  },
});

// ─── QUERIES ─────────────────────────────────────────────

export const getNotebookSources = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("sources")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const getSource = query({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const source = await ctx.db.get(args.sourceId);
    if (!source || source.userId !== user._id) return null;

    return source;
  },
});

export const getSourceStorageUrl = query({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const source = await ctx.db.get(args.sourceId);
    if (!source || source.userId !== user._id) return null;
    if (!source.storageId) return null;

    return await ctx.storage.getUrl(source.storageId);
  },
});

export const saveExtractedText = mutation({
  args: {
    sourceId: v.id("sources"),
    extractedText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      extractedText: args.extractedText,
    });
  },
});
