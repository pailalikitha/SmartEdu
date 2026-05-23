"use client";

import { Label } from "@/components/ui/label";
import { useParentStore } from "@/store/parent-store";
import { getStudentFullName } from "@/types/student";

export function ChildSelector() {
  const children = useParentStore((s) => s.children);
  const selectedStudentId = useParentStore((s) => s.selectedStudentId);
  const setSelectedStudentId = useParentStore((s) => s.setSelectedStudentId);

  if (children.length <= 1) return null;

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Label htmlFor="child-select" className="shrink-0 text-sm">
        Viewing child
      </Label>
      <select
        id="child-select"
        className="h-10 w-full max-w-xs rounded-lg border border-border bg-card px-3 text-sm sm:w-auto"
        value={selectedStudentId ?? ""}
        onChange={(e) => setSelectedStudentId(e.target.value || null)}
      >
        {children.map((child) => (
          <option key={child.id} value={child.authUserId ?? child.id}>
            {getStudentFullName(child)}
          </option>
        ))}
      </select>
    </div>
  );
}
