// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Already done — just for reference
  users: defineTable({
    email: v.string(),
    clerkUserId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byClerkUserId", ["clerkUserId"])
    .index("byEmail", ["email"]),

  // Top-level container, like a "project" in NotebookLM
  notebooks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // A source file uploaded to a notebook (PDF, text, etc.)
  sources: defineTable({
    notebookId: v.id("notebooks"),
    userId: v.id("users"),
    title: v.string(),
    type: v.union(
      v.literal("pdf"),
      v.literal("text"),
      v.literal("url"),
      v.literal("youtube"),
    ),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    extractedText: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
  })
    .index("by_notebook", ["notebookId"])
    .index("by_user", ["userId"])
    .index("by_status", ["notebookId", "status"]),

  // Chunks from sources, each with an embedding vector
  chunks: defineTable({
    notebookId: v.id("notebooks"),
    sourceId: v.id("sources"),
    text: v.string(),
    // Index within the source (ordering)
    chunkIndex: v.number(),
    // Gemini text-embedding-004 → 768 dimensions
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  })
    .index("by_source", ["sourceId"])
    .index("by_notebook", ["notebookId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["notebookId"],
    }),

  // Chat messages per notebook (Q&A history)
  messages: defineTable({
    notebookId: v.id("notebooks"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // Source chunks used to generate this response (for citations)
    sourceChunkIds: v.optional(v.array(v.id("chunks"))),
    createdAt: v.number(),
  })
    .index("by_notebook", ["notebookId"])
    .index("by_notebook_time", ["notebookId", "createdAt"]),

  // TipTap editor notes per notebook
  notes: defineTable({
    notebookId: v.id("notebooks"),
    userId: v.id("users"),
    // TipTap JSON output
    content: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_notebook", ["notebookId"]),
});
