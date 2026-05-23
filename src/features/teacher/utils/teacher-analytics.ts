import { calculateAttendancePercent } from "@/services/attendance.service";
import { getMarksStudentId } from "@/services/student.service";
import {
  computeSubjectAverages,
  type SubjectAverage,
} from "@/lib/utils/subject-stats";
import type { ClassRoom } from "@/types/class";
import type { Student } from "@/types/student";
import type { StudentMarkEntry } from "@/types/student-marks";
import type { AttendanceRecord } from "@/types/attendance";
import type { StudentMarksMap } from "@/features/teacher/hooks/use-teacher-roster-snapshot";

export type AtRiskStudent = {
  student: Student;
  className: string;
  marksAvg: number | null;
  attendancePct: number | null;
  riskReason: "Low Marks" | "Low Attendance" | "Both";
};

export function averageMarkEntries(entries: StudentMarkEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.percentage, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

export function computeTeacherAnalytics(
  classes: ClassRoom[],
  students: Student[],
  marksByStudent: StudentMarksMap,
  attendanceByStudent: Record<string, AttendanceRecord[]>,
) {
  const classNameById = new Map(classes.map((c) => [c.id, c.name]));
  const allEntries: StudentMarkEntry[] = [];
  const allAttendance: AttendanceRecord[] = [];
  const atRisk: AtRiskStudent[] = [];

  for (const student of students) {
    const marksId = getMarksStudentId(student);
    const entries = marksByStudent[marksId] ?? [];
    const attendance = attendanceByStudent[marksId] ?? [];
    allEntries.push(...entries);
    allAttendance.push(...attendance);

    const marksAvg = averageMarkEntries(entries);
    const attendancePct = calculateAttendancePercent(attendance);
    const lowMarks = marksAvg !== null && marksAvg < 60;
    const lowAttendance =
      attendancePct !== null && attendancePct < 75;

    if (lowMarks || lowAttendance) {
      let riskReason: AtRiskStudent["riskReason"] = "Low Marks";
      if (lowMarks && lowAttendance) riskReason = "Both";
      else if (lowAttendance) riskReason = "Low Attendance";

      atRisk.push({
        student,
        className: student.classId
          ? (classNameById.get(student.classId) ?? "—")
          : "—",
        marksAvg,
        attendancePct,
        riskReason,
      });
    }
  }

  const classAverage =
    allEntries.length > 0
      ? Math.round(
          (allEntries.reduce((s, e) => s + e.percentage, 0) /
            allEntries.length) *
            10,
        ) / 10
      : null;

  const attendanceRate = calculateAttendancePercent(allAttendance);
  const subjectAverages: SubjectAverage[] = computeSubjectAverages(allEntries);

  return {
    totalStudents: students.length,
    classAverage,
    attendanceRate,
    atRisk,
    subjectAverages,
    allEntries,
  };
}

export function buildTrendChartData(entries: StudentMarkEntry[]) {
  const dateMap = new Map<string, Record<string, number | string>>();

  for (const entry of entries) {
    const row = dateMap.get(entry.date) ?? { date: entry.date, label: entry.date };
    const existing = row[entry.subject];
    if (typeof existing === "number") {
      row[entry.subject] = Math.round(((existing + entry.percentage) / 2) * 10) / 10;
    } else {
      row[entry.subject] = entry.percentage;
    }
    dateMap.set(entry.date, row);
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}
