import { NextResponse } from "next/server";

import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";

const VALID_ROLES = new Set<string>(Object.values(USER_ROLES));

function parseRole(value: unknown): UserRole | undefined {
  if (typeof value !== "string" || !VALID_ROLES.has(value)) return undefined;
  return value as UserRole;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;
    const role = parseRole(body?.role);

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing idToken" },
        { status: 400 },
      );
    }

    await setSessionCookie(idToken, role);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to clear session" },
      { status: 500 },
    );
  }
}
