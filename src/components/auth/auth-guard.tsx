"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getRoleHomePath } from "@/constants/auth";
import type { UserRole } from "@/constants/roles";
import { isAdminRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/services/user.service";

function roleAllowed(userRole: UserRole, allowed: UserRole[]): boolean {
  if (allowed.includes(userRole)) return true;
  if (allowed.some((r) => r === "admin" || r === "principal") && isAdminRole(userRole)) {
    return true;
  }
  return false;
}

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(ROUTES.login);
      return;
    }

    if (allowedRoles && !roleAllowed(user.role, allowedRoles)) {
      router.replace(getRoleHomePath(user.role));
      return;
    }

    void getUserProfile(user.id).then((profile) => {
      if (profile && (profile as { status?: string }).status === "inactive") {
        router.replace(ROUTES.login);
      }
    });
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    user,
    allowedRoles,
    router,
  ]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !roleAllowed(user.role, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
