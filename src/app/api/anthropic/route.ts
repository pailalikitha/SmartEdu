import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const GROQ_MODEL = "llama-3.1-8b-instant";

type AnthropicRequestBody = {
  model?: string;
  max_tokens?: number;
  system?: string;
  messages: { role: string; content: string }[];
};

function toAnthropicShapedResponse(text: string, modelName: string) {
  return {
    id: "msg_groq",
    type: "message",
    role: "assistant",
    model: modelName,
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    usage: { input_tokens: 0, output_tokens: 0 },
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  let body: AnthropicRequestBody;
  try {
    body = (await request.json()) as AnthropicRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required." },
      { status: 400 },
    );
  }

  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [];

  if (body.system?.trim()) {
    groqMessages.push({ role: "system", content: body.system });
  }

  groqMessages.push(
    ...body.messages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    })),
  );

  const modelName = GROQ_MODEL;
  console.log("Using Groq model:", modelName);

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: groqMessages,
      max_tokens: body.max_tokens ?? 1000,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Empty AI response from Groq." },
        { status: 502 },
      );
    }

    return NextResponse.json(toAnthropicShapedResponse(text, modelName));
  } catch (err) {
    console.error("[/api/anthropic] Groq request failed:", err);

    const message =
      err instanceof Groq.APIError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Groq API error.";

    const status =
      err instanceof Groq.APIError && err.status ? err.status : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
