import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.GEMINI_API_KEY,
    keySuffix: process.env.GEMINI_API_KEY?.slice(-8),
  });
}
