"use client";

import type { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return {
    user,
    role: (user?.role ?? null) as UserRole | null,
    isAuthenticated,
    isLoading,
    isInitialized,
    /** True when auth listener has finished and is not loading */
    isReady: isInitialized && !isLoading,
  };
}
