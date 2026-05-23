"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  clearSession,
  mapFirebaseUserWithProfile,
  persistSession,
} from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setInitialized(true);
      clearAuth();
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const user = await mapFirebaseUserWithProfile(firebaseUser);
          setUser(user);
          await persistSession(user.role);
        } else {
          clearAuth();
          await clearSession().catch(() => undefined);
        }
      } catch {
        clearAuth();
      } finally {
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, clearAuth, setInitialized]);

  return <>{children}</>;
}
