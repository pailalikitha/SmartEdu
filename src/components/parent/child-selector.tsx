"use client";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui";
import { useParentContext } from "@/contexts/parent-context";
import { getStudentFullName } from "@/types/student";

export function ChildSelector() {
  const {
    children,
    selectedStudentId,
    setSelectedStudentId,
    selectedChild,
  } = useParentContext();

  if (children.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <Text className="text-sm font-medium">
        Viewing: {selectedChild ? getStudentFullName(selectedChild) : "—"}&apos;s
        Dashboard
      </Text>
      {children.length > 1 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Label htmlFor="child-select" className="shrink-0 text-sm">
            Switch child
          </Label>
          <select
            id="child-select"
            className="h-10 w-full max-w-xs rounded-lg border border-border bg-card px-3 text-sm sm:w-auto"
            value={selectedStudentId ?? ""}
            onChange={(e) => setSelectedStudentId(e.target.value || null)}
          >
            {children.map((child) => {
              const id = child.uid ?? child.authUserId ?? child.id;
              return (
                <option key={child.id} value={id}>
                  {getStudentFullName(child)}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}
    </div>
  );
}
