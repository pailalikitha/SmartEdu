import type { AttendanceQueryFilters } from "@/services/attendance.service";
import type { ListStudentsFilters } from "@/services/student.service";

import type { AttendanceFilters } from "./attendance-stats";

export function toAttendanceQueryFilters(
  filters: AttendanceFilters,
): AttendanceQueryFilters {
  const out: AttendanceQueryFilters = {};
  if (filters.grade !== "all") out.grade = filters.grade;
  if (filters.section !== "all") out.section = filters.section;
  return out;
}

export function toStudentListFilters(
  filters: AttendanceFilters,
): ListStudentsFilters {
  const out: ListStudentsFilters = { status: "active" };
  if (filters.grade !== "all") out.grade = filters.grade;
  if (filters.section !== "all") out.section = filters.section;
  return out;
}
