"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getRoleHomePath } from "@/constants/auth";
import { useAuth } from "@/hooks/use-auth";

/** Redirects authenticated users away from login/register. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (isAuthenticated && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div
          className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return <>{children}</>;
}
