"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ROUTES } from "@/constants/routes";
import { clearSession, logOut } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      await clearSession().catch(() => undefined);
      clearAuth();
      router.replace(ROUTES.login);
      router.refresh();
    } catch {
      clearAuth();
      router.replace(ROUTES.login);
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearAuth, router]);

  return { logout, isLoggingOut };
}
