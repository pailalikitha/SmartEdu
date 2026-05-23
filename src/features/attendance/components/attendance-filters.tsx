"use client";

import { Label } from "@/components/ui";
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
} from "@/features/admin/students/schemas/student.schema";
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import type { AttendanceFilters } from "@/features/attendance/utils/attendance-stats";
import { cn } from "@/lib/utils";

type AttendanceFiltersProps = {
  filters: AttendanceFilters;
  onChange: (filters: AttendanceFilters) => void;
  showStatus?: boolean;
  className?: string;
};

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AttendanceFiltersBar({
  filters,
  onChange,
  showStatus = false,
  className,
}: AttendanceFiltersProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        showStatus ? "lg:grid-cols-3" : "lg:grid-cols-2",
        className,
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="filter-grade">Grade</Label>
        <select
          id="filter-grade"
          className={selectClass}
          value={filters.grade}
          onChange={(e) => onChange({ ...filters, grade: e.target.value })}
        >
          <option value="all">All grades</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-section">Section</Label>
        <select
          id="filter-section"
          className={selectClass}
          value={filters.section}
          onChange={(e) => onChange({ ...filters, section: e.target.value })}
        >
          <option value="all">All sections</option>
          {SECTION_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Section {s}
            </option>
          ))}
        </select>
      </div>

      {showStatus ? (
        <div className="space-y-2">
          <Label htmlFor="filter-status">Status</Label>
          <select
            id="filter-status"
            className={selectClass}
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as AttendanceFilters["status"],
              })
            }
          >
            <option value="all">All statuses</option>
            {ATTENDANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ATTENDANCE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
