import { NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const PROMPT = "Say hello";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: PROMPT }],
        },
      ],
    }),
  });

  const responseBody = (await response.json()) as Record<string, unknown>;

  return NextResponse.json({
    status: response.status,
    response: responseBody,
  });
}
