"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  getOnboardingPath,
  getRoleHomePath,
} from "@/constants/auth";
import { loginTabToUserRole, type LoginRoleTab } from "@/constants/roles";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  persistSession,
  sendPasswordReset,
  signIn,
  type SignInInput,
} from "@/services/auth.service";
import { studentNeedsOnboarding } from "@/services/onboarding.service";
import { teacherNeedsOnboarding } from "@/services/teachers.service";
import { useAuthStore } from "@/store/auth-store";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resolveRedirect = useCallback(
    async (userId: string, role: ReturnType<typeof loginTabToUserRole>) => {
      const onboardingPath = getOnboardingPath(role);
      if (role === "teacher" && (await teacherNeedsOnboarding(userId))) {
        return onboardingPath ?? getRoleHomePath(role);
      }
      if (role === "student" && (await studentNeedsOnboarding(userId))) {
        return onboardingPath ?? getRoleHomePath(role);
      }
      return searchParams.get("from") ?? getRoleHomePath(role);
    },
    [searchParams],
  );

  const login = useCallback(
    async (
      input: SignInInput & { expectedRoleTab: LoginRoleTab },
    ) => {
      setError(null);
      setResetSent(false);

      if (!isFirebaseConfigured()) {
        setError(
          "Firebase is not configured. Add keys to .env.local (see .env.example).",
        );
        return false;
      }

      setIsLoading(true);
      try {
        const user = await signIn(input);
        const expectedRole = loginTabToUserRole(input.expectedRoleTab);

        if (user.role !== expectedRole) {
          setError(
            `This account is registered as ${user.role}. Select the correct role tab.`,
          );
          return false;
        }

        setUser(user);
        await persistSession(user.role);

        const redirectTo = await resolveRedirect(user.id, user.role);
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
    [router, resolveRedirect, setUser],
  );

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    setResetSent(false);

    if (!isFirebaseConfigured()) {
      setError(
        "Firebase is not configured. Add keys to .env.local (see .env.example).",
      );
      return false;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    forgotPassword,
    error,
    setError,
    resetSent,
    isLoading,
  };
}
