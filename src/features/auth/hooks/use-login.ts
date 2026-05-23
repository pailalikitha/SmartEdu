"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { getRoleHomePath } from "@/constants/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  persistSession,
  signIn,
  type SignInInput,
} from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (input: SignInInput) => {
      setError(null);

      if (!isFirebaseConfigured()) {
        setError(
          "Firebase is not configured. Add keys to .env.local (see .env.example).",
        );
        return false;
      }

      setIsLoading(true);
      try {
        const user = await signIn(input);
        setUser(user);
        await persistSession(user.role);

        const redirectTo =
          searchParams.get("from") ?? getRoleHomePath(user.role);
        router.replace(redirectTo);
        router.refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign in failed.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, searchParams, setUser],
  );

  return { login, error, setError, isLoading };
}
