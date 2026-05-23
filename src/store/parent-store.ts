import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Student } from "@/types/student";

type ParentState = {
  children: Student[];
  selectedStudentId: string | null;
  setChildren: (children: Student[]) => void;
  setSelectedStudentId: (id: string | null) => void;
  clearParent: () => void;
};

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      children: [],
      selectedStudentId: null,
      setChildren: (children) =>
        set((state) => {
          const firstId = children[0]
            ? (children[0].authUserId ?? children[0].id)
            : null;
          const keepExisting =
            state.selectedStudentId &&
            children.some(
              (c) =>
                c.id === state.selectedStudentId ||
                c.authUserId === state.selectedStudentId,
            );
          return {
            children,
            selectedStudentId: keepExisting
              ? state.selectedStudentId
              : firstId,
          };
        }),
      setSelectedStudentId: (id) => set({ selectedStudentId: id }),
      clearParent: () => set({ children: [], selectedStudentId: null }),
    }),
    { name: "smartedu-parent" },
  ),
);

export function getSelectedChild(state: ParentState): Student | null {
  if (!state.selectedStudentId) return state.children[0] ?? null;
  return (
    state.children.find(
      (c) => c.id === state.selectedStudentId || c.authUserId === state.selectedStudentId,
    ) ?? null
  );
}

export function getSelectedStudentAuthId(state: ParentState): string | null {
  const child = getSelectedChild(state);
  return child ? (child.authUserId ?? child.id) : null;
}
