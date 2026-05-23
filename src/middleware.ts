import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getPortalRoleFromPath,
  getRoleHomePath,
  isAuthRoute,
  isProtectedRoute,
  SESSION_COOKIE,
  SESSION_ROLE_COOKIE,
} from "@/constants/auth";
import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

const VALID_ROLES = new Set<string>(Object.values(USER_ROLES));

function parseRoleCookie(value: string | undefined): UserRole | null {
  if (!value || !VALID_ROLES.has(value)) return null;
  return value as UserRole;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const role = parseRoleCookie(
    request.cookies.get(SESSION_ROLE_COOKIE)?.value,
  );

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && role) {
    const portalRole = getPortalRoleFromPath(pathname);

    if (portalRole && portalRole !== role) {
      return NextResponse.redirect(
        new URL(getRoleHomePath(role), request.url),
      );
    }

    if (isAuthRoute(pathname)) {
      return NextResponse.redirect(
        new URL(getRoleHomePath(role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
