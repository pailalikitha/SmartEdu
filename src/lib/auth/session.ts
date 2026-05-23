import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_ROLE_COOKIE } from "@/constants/auth";
import type { UserRole } from "@/constants/roles";

const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function setSessionCookie(idToken: string, role?: UserRole) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, idToken, cookieOptions);

  if (role) {
    cookieStore.set(SESSION_ROLE_COOKIE, role, cookieOptions);
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(SESSION_ROLE_COOKIE);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export function hasSessionCookie(
  cookieHeader: string | null | undefined,
): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => {
    const [name] = part.trim().split("=");
    return name === SESSION_COOKIE;
  });
}
