import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, sourceMode, notebookId } = await req.json();

    let systemPrompt = `You are a helpful AI assistant called Neuron. Be concise, friendly, and accurate.`;

    if (sourceMode && notebookId) {
      const lastMessage = messages[messages.length - 1].content;

      const embeddingRes = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: lastMessage,
      });
      const embedding = embeddingRes.embeddings?.[0]?.values ?? [];

      const chunks = await convex.action(api.chunks.searchChunks, {
        notebookId: notebookId as Id<"notebooks">,
        embedding,
        limit: 5,
      });

      const context = chunks
        .map((c: any, i: number) => `[Source ${i + 1}]: ${c.text}`)
        .join("\n\n");

      systemPrompt = `You are Neuron, a helpful AI assistant. Answer ONLY based on the following source material. If the answer is not in the sources, say "I couldn't find this in your sources."

SOURCE MATERIAL:
${context}

Rules:
- Answer strictly from the sources above
- Quote or reference sources when possible  
- If unsure, say so clearly`;
    }

    // ✅ Streaming response
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true, // ← ye add karo
    });

    // ✅ ReadableStream banao
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
