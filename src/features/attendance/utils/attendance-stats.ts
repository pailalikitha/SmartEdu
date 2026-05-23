import { getMonthRange } from "@/lib/utils/date";
import { formatPercentage } from "@/lib/utils/format";
import type { BarChartItem } from "@/components/dashboard/bar-chart";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import type { Student } from "@/types/student";
import { getStudentFullName } from "@/types/student";

export type AttendanceFilters = {
  grade: string;
  section: string;
  status: AttendanceStatus | "all";
};

export function filterRecords(
  records: AttendanceRecord[],
  filters: AttendanceFilters,
): AttendanceRecord[] {
  return records.filter((r) => {
    if (filters.grade !== "all" && r.grade !== filters.grade) return false;
    if (filters.section !== "all" && r.section !== filters.section)
      return false;
    if (filters.status !== "all" && r.status !== filters.status) return false;
    return true;
  });
}

export function filterActiveStudents(
  students: Student[],
  grade: string,
  section: string,
): Student[] {
  return students.filter((s) => {
    if (s.status !== "active") return false;
    if (grade !== "all" && s.grade !== grade) return false;
    if (section !== "all" && s.section !== section) return false;
    return true;
  });
}

export type DailyAttendanceStat = {
  date: string;
  dayLabel: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
};

export function buildDailyStats(
  records: AttendanceRecord[],
  year: number,
  month: number,
): DailyAttendanceStat[] {
  const { daysInMonth } = getMonthRange(year, month);
  const byDate = new Map<string, AttendanceRecord[]>();

  for (const record of records) {
    const list = byDate.get(record.date) ?? [];
    list.push(record);
    byDate.set(record.date, list);
  }

  const stats: DailyAttendanceStat[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayRecords = byDate.get(date) ?? [];
    const present = dayRecords.filter((r) => r.status === "present").length;
    const absent = dayRecords.filter((r) => r.status === "absent").length;
    const late = dayRecords.filter((r) => r.status === "late").length;
    const excused = dayRecords.filter((r) => r.status === "excused").length;
    const total = dayRecords.length;
    const rate =
      total > 0 ? ((present + late + excused) / total) * 100 : 0;

    stats.push({
      date,
      dayLabel: String(day),
      present,
      absent,
      late,
      excused,
      total,
      rate: Math.round(rate * 10) / 10,
    });
  }

  return stats;
}

export type StudentMonthlyStat = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  grade: string;
  section: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  markedDays: number;
  rate: number;
};

export function buildStudentMonthlyStats(
  records: AttendanceRecord[],
  students: Student[],
): StudentMonthlyStat[] {
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const agg = new Map<
    string,
    { present: number; absent: number; late: number; excused: number }
  >();

  for (const record of records) {
    const current = agg.get(record.studentId) ?? {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
    if (record.status === "present") current.present += 1;
    else if (record.status === "absent") current.absent += 1;
    else if (record.status === "late") current.late += 1;
    else if (record.status === "excused") current.excused += 1;
    agg.set(record.studentId, current);
  }

  const result: StudentMonthlyStat[] = [];

  for (const [studentId, counts] of agg) {
    const student = studentMap.get(studentId);
    const markedDays =
      counts.present + counts.absent + counts.late + counts.excused;
    const rate =
      markedDays > 0
        ? ((counts.present + counts.late + counts.excused) / markedDays) * 100
        : 0;

    result.push({
      studentId,
      studentName: student
        ? getStudentFullName(student)
        : records.find((r) => r.studentId === studentId)?.studentName ?? "Unknown",
      rollNumber: student?.rollNumber ?? "",
      grade: student?.grade ?? records.find((r) => r.studentId === studentId)?.grade ?? "",
      section:
        student?.section ?? records.find((r) => r.studentId === studentId)?.section ?? "",
      ...counts,
      markedDays,
      rate: Math.round(rate * 10) / 10,
    });
  }

  return result.sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export function buildStatusChartData(
  records: AttendanceRecord[],
): BarChartItem[] {
  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const r of records) counts[r.status] += 1;

  return [
    { label: "Present", value: counts.present },
    { label: "Absent", value: counts.absent },
    { label: "Late", value: counts.late },
    { label: "Excused", value: counts.excused },
  ];
}

export function buildDailyRateChartData(
  dailyStats: DailyAttendanceStat[],
): BarChartItem[] {
  return dailyStats
    .filter((d) => d.total > 0)
    .map((d) => ({ label: d.dayLabel, value: d.rate }));
}

export function summarizeMonth(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter(
    (r) => r.status === "present" || r.status === "late" || r.status === "excused",
  ).length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = total > 0 ? (present / total) * 100 : 0;

  return {
    totalRecords: total,
    presentCount: present,
    absentCount: absent,
    averageRate: Math.round(rate * 10) / 10,
    averageRateLabel: formatPercentage(rate),
  };
}
