import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {


const { messages, sourceMode, userName } = await req.json();

const systemPrompt = sourceMode
  ? `You are a helpful assistant called Neuron. The user's name is ${userName}. Answer ONLY based on the information provided by the user in this conversation.`
  : `You are a helpful AI assistant called Neuron. The user's name is ${userName}. Address them by name occasionally to make the conversation feel personal. Be concise, friendly, and accurate.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    return NextResponse.json({
      role: "assistant",
      content: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("CHAT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
