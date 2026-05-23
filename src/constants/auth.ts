import type { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export const SESSION_COOKIE = "smartedu-session";
export const SESSION_ROLE_COOKIE = "smartedu-role";

export const AUTH_ROUTES = [ROUTES.login, ROUTES.register] as const;

export const PROTECTED_PREFIXES = ["/student", "/teacher", "/admin"] as const;

export const ROLE_HOME: Record<UserRole, string> = {
  student: ROUTES.student.root,
  teacher: ROUTES.teacher.root,
  principal: ROUTES.admin.root,
};

export function getRoleHomePath(role: UserRole): string {
  return ROLE_HOME[role];
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getPortalRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/admin")) return "principal";
  return null;
}
