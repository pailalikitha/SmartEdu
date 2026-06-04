import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const MODEL = "llama-3.1-8b-instant";
const PROMPT = "Say hello";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  const groq = new Groq({ apiKey });

  try {
    console.log("Using Groq model:", MODEL);

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: PROMPT }],
      max_tokens: 100,
    });

    const text = completion.choices[0]?.message?.content;

    return NextResponse.json({
      status: 200,
      response: {
        model: MODEL,
        text: text ?? null,
        completion,
      },
    });
  } catch (err) {
    console.error("[/api/test-groq] Groq request failed:", err);

    const message =
      err instanceof Groq.APIError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Groq API error.";

    const status =
      err instanceof Groq.APIError && err.status ? err.status : 502;

    return NextResponse.json(
      {
        status,
        response: { error: message },
      },
      { status },
    );
  }
}
