"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getRoleHomePath } from "@/constants/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  persistSession,
  signUp,
  type SignUpInput,
} from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(
    async (input: SignUpInput) => {
      setError(null);

      if (!isFirebaseConfigured()) {
        setError(
          "Firebase is not configured. Add keys to .env.local (see .env.example).",
        );
        return false;
      }

      setIsLoading(true);
      try {
        const user = await signUp(input);
        setUser(user);
        await persistSession(user.role);
        router.replace(getRoleHomePath(user.role));
        router.refresh();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Registration failed.",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, setUser],
  );

  return { register, error, setError, isLoading };
}
