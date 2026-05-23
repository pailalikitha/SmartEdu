import type { UserRole } from "@/constants/roles";
import { isAdminRole, USER_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export const SESSION_COOKIE = "smartedu-session";
export const SESSION_ROLE_COOKIE = "smartedu-role";

export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.resetPassword,
] as const;

export const PROTECTED_PREFIXES = [
  "/student",
  "/teacher",
  "/admin",
  "/parent",
] as const;

export const ROLE_HOME: Record<UserRole, string> = {
  student: ROUTES.student.dashboard,
  teacher: ROUTES.teacher.dashboard,
  admin: ROUTES.admin.dashboard,
  principal: ROUTES.admin.dashboard,
  parent: ROUTES.parent.dashboard,
};

export function getRoleHomePath(role: UserRole): string {
  return ROLE_HOME[role];
}

export function getOnboardingPath(role: UserRole): string | null {
  if (role === USER_ROLES.student) return ROUTES.student.onboarding;
  if (role === USER_ROLES.teacher) return ROUTES.teacher.onboarding;
  return null;
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
  if (pathname.startsWith("/student")) return USER_ROLES.student;
  if (pathname.startsWith("/teacher")) return USER_ROLES.teacher;
  if (pathname.startsWith("/admin")) return USER_ROLES.admin;
  if (pathname.startsWith("/parent")) return USER_ROLES.parent;
  return null;
}

export function portalRoleMatchesUser(
  portalRole: UserRole,
  userRole: UserRole,
): boolean {
  if (portalRole === USER_ROLES.admin && isAdminRole(userRole)) return true;
  return portalRole === userRole;
}
