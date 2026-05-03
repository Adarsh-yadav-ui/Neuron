let's understand the whole thing.

Here's the full stack for **Cortex**:

---

## Tech Stack (Final)

| Layer                   | Tool                        |
| ----------------------- | --------------------------- |
| Framework               | Next.js 16.2 (App Router)   |
| Auth                    | Clerk                       |
| Backend + DB + Realtime | Convex                      |
| File Storage            | Convex Storage              |
| Background Jobs         | Inngest                     |
| LLM                     | Gemini 1.5 Pro              |
| Embeddings              | Gemini `text-embedding-004` |
| Vector Search           | Convex Vector Search        |
| Block Editor            | TipTap                      |
| UI                      | shadcn/ui + Tailwind CSS    |
| Hosting                 | Vercel                      |

---

## Folder Structure

```
cortex/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx            # Sidebar + main layout
│   │   ├── dashboard/
│   │   │   └── page.tsx          # All books grid
│   │   └── book/[bookId]/
│   │       ├── page.tsx          # Main book view
│   │       ├── chat/
│   │       │   └── page.tsx      # Q&A chat
│   │       └── notes/
│   │           └── page.tsx      # TipTap editor
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # shadcn components
│   ├── book/
│   │   ├── BookUploader.tsx
│   │   ├── BookCard.tsx
│   │   └── BookStatus.tsx        # Processing indicator
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── editor/
│       └── TipTapEditor.tsx
│
├── convex/
│   ├── schema.ts
│   ├── books.ts                  # Upload, list, get
│   ├── chunks.ts                 # Vector search query
│   ├── messages.ts               # Chat history
│   ├── notes.ts                  # Save/load TipTap content
│   └── http.ts                   # Inngest webhook endpoint
│
├── inngest/
│   ├── client.ts
│   └── functions/
│       └── processBook.ts        # Main ingestion pipeline
│
└── lib/
    ├── gemini.ts                 # Gemini client
    └── pdf.ts                    # PDF text extraction
```

---

## The Inngest Pipeline (`processBook.ts`)

```
Trigger: book uploaded
  │
  ├── Step 1: Extract text from PDF (pdf-parse)
  ├── Step 2: Split into chunks (sliding window, ~500 words, 50 overlap)
  ├── Step 3: Embed each chunk in batches (Gemini text-embedding-004)
  ├── Step 4: Write chunks + vectors to Convex
  └── Step 5: Mark book status as "ready"
```

Each step is isolated — if embedding fails at chunk 47, Inngest retries from chunk 47, not from scratch.

---

## The RAG Flow (per user question)

```
User types question
  │
  ├── 1. Embed the question (Gemini)
  ├── 2. Vector search Convex — top 6 chunks filtered by bookId
  ├── 3. Build prompt:
  │      "Answer based only on these excerpts: [chunks]
  │       Question: [question]"
  ├── 4. Stream response from Gemini 1.5 Pro
  └── 5. Save message + sourceChunkIds to Convex
```

---

## Build Phases

**Phase 1 — Foundation** (Week 1)

- Next.js + Clerk + Convex + shadcn setup
- Book upload → Convex Storage
- Dashboard showing books

**Phase 2 — Ingestion** (Week 2)

- Inngest pipeline: PDF → chunks → embeddings → Convex
- Book status indicator (uploaded → processing → ready)

**Phase 3 — Chat** (Week 3)

- Vector search query
- RAG prompt assembly
- Streaming chat UI with TipTap

**Phase 4 — Notes** (Week 4)

- TipTap editor wired to Convex
- Auto-save on change

**Phase 5 — Polish** (Week 5+)

- Source citations in chat
- Keyboard shortcuts
- Good empty states + loading skeletons

---
