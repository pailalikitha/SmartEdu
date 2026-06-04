import { NextResponse } from "next/server";

const GEMINI_FLASH_MODEL = "gemini-2.0-flash";

type AnthropicRequestBody = {
  model?: string;
  max_tokens?: number;
  system?: string;
  messages: { role: string; content: string }[];
};

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

type GeminiGenerateResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: {
    message?: string;
    code?: number;
    status?: string;
  };
};

function toGeminiRole(role: string): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

function toAnthropicShapedResponse(text: string) {
  return {
    id: "msg_gemini",
    type: "message",
    role: "assistant",
    model: GEMINI_FLASH_MODEL,
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    usage: { input_tokens: 0, output_tokens: 0 },
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
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

  const contents: GeminiContent[] = body.messages.map((message) => ({
    role: toGeminiRole(message.role),
    parts: [{ text: message.content }],
  }));

  const geminiBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: body.max_tokens ?? 1000,
    },
  };

  if (body.system?.trim()) {
    geminiBody.systemInstruction = {
      parts: [{ text: body.system }],
    };
  }

  const model =
    body.model?.startsWith("gemini-") === true ? body.model : GEMINI_FLASH_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(geminiBody),
    });

    const data = (await response.json()) as GeminiGenerateResponse;

    if (!response.ok) {
      const message =
        typeof data?.error?.message === "string"
          ? data.error.message
          : "Gemini API error.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("");

    if (!text) {
      return NextResponse.json(
        { error: "Empty AI response from Gemini." },
        { status: 502 },
      );
    }

    return NextResponse.json(toAnthropicShapedResponse(text));
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Gemini API." },
      { status: 502 },
    );
  }
}
