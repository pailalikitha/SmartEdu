"use client";

import { createContext, useContext, useMemo } from "react";

import {
  getSelectedChild,
  getSelectedStudentAuthId,
  useParentStore,
} from "@/store/parent-store";
import type { Student } from "@/types/student";

export type ParentContextValue = {
  children: Student[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedChild: Student | null;
  selectedStudentAuthId: string | null;
  clearParent: () => void;
};

const ParentContext = createContext<ParentContextValue | null>(null);

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const linkedChildren = useParentStore((s) => s.children);
  const selectedStudentId = useParentStore((s) => s.selectedStudentId);
  const setSelectedStudentId = useParentStore((s) => s.setSelectedStudentId);
  const clearParent = useParentStore((s) => s.clearParent);

  const value = useMemo((): ParentContextValue => {
    const slice = {
      children: linkedChildren,
      selectedStudentId,
    };
    return {
      children: linkedChildren,
      selectedStudentId,
      setSelectedStudentId,
      selectedChild: getSelectedChild(slice),
      selectedStudentAuthId: getSelectedStudentAuthId(slice),
      clearParent,
    };
  }, [linkedChildren, selectedStudentId, setSelectedStudentId, clearParent]);

  return (
    <ParentContext.Provider value={value}>{children}</ParentContext.Provider>
  );
}

export function useParentContext(): ParentContextValue {
  const ctx = useContext(ParentContext);
  if (!ctx) {
    throw new Error("useParentContext must be used within ParentProvider");
  }
  return ctx;
}
