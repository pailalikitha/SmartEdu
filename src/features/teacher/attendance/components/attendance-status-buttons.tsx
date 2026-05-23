"use client";

import type { ClassAttendanceStatus } from "@/types/class-attendance";
import { cn } from "@/lib/utils";

const OPTIONS: ClassAttendanceStatus[] = ["present", "absent", "late"];

const LABELS: Record<ClassAttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
};

const STYLES: Record<
  ClassAttendanceStatus,
  { active: string; idle: string }
> = {
  present: {
    active: "bg-success text-white border-success",
    idle: "border-success/30 text-success hover:bg-success/10",
  },
  absent: {
    active: "bg-destructive text-white border-destructive",
    idle: "border-destructive/30 text-destructive hover:bg-destructive/10",
  },
  late: {
    active: "bg-warning text-white border-warning",
    idle: "border-warning/30 text-warning hover:bg-warning/10",
  },
};

type AttendanceStatusButtonsProps = {
  value?: ClassAttendanceStatus;
  onChange: (status: ClassAttendanceStatus) => void;
  disabled?: boolean;
};

export function AttendanceStatusButtons({
  value,
  onChange,
  disabled,
}: AttendanceStatusButtonsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Attendance status"
    >
      {OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          disabled={disabled}
          aria-pressed={value === status}
          onClick={() => onChange(status)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
            value === status ? STYLES[status].active : STYLES[status].idle,
            !value && "text-muted-foreground border-border bg-muted/30",
          )}
        >
          {LABELS[status]}
        </button>
      ))}
    </div>
  );
}
