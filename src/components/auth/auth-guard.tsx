"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getRoleHomePath } from "@/constants/auth";
import type { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";

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

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
