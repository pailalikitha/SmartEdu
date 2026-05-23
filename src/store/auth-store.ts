import { create } from "zustand";

import type { User } from "@/types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) =>
    set({ isInitialized, isLoading: false }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

/** Selectors for fine-grained subscriptions */
export const authSelectors = {
  user: (s: AuthState) => s.user,
  isAuthenticated: (s: AuthState) => s.isAuthenticated,
  isLoading: (s: AuthState) => s.isLoading,
  isInitialized: (s: AuthState) => s.isInitialized,
};
