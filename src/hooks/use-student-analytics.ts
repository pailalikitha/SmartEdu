"use client";

import { useMemo } from "react";

import {
  getPerformanceBadge,
  type PerformanceBadge,
} from "@/features/student-analytics/utils/performance";
import { buildTrendChartData } from "@/features/teacher/utils/teacher-analytics";
import { averageMarkEntries } from "@/features/teacher/utils/teacher-analytics";
import {
  buildChartData,
  type ChartRow,
} from "@/features/student/marks/utils/marks-stats";
import { useStudentAttendanceSnapshot } from "@/hooks/use-student-attendance-snapshot";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { calculateAttendancePercent } from "@/services/attendance.service";
import {
  computeSubjectAverages,
  partitionSubjectsByThreshold,
  type SubjectAverage,
} from "@/lib/utils/subject-stats";
import type { AttendanceRecord } from "@/types/attendance";
import type { StudentMarkEntry } from "@/types/student-marks";

export type StudentAnalyticsResult = {
  overallAverage: number | null;
  subjectAverages: SubjectAverage[];
  strongSubjects: SubjectAverage[];
  weakSubjects: SubjectAverage[];
  weakSubjectCount: number;
  attendanceRate: number | null;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceByDate: Record<string, AttendanceRecord["status"]>;
  examHistory: StudentMarkEntry[];
  trend: ChartRow[];
  trendSubjects: string[];
  performanceBadge: PerformanceBadge;
  marksEntries: StudentMarkEntry[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
};

export function useStudentAnalytics(
  studentId: string | undefined,
): StudentAnalyticsResult {
  const {
    entries: marksEntries,
    isLoading: marksLoading,
    error: marksError,
  } = useStudentMarksSnapshot(studentId);

  const {
    records: attendanceRecords,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useStudentAttendanceSnapshot(studentId);

  return useMemo(() => {
    const loading = marksLoading || attendanceLoading;
    const error = marksError ?? attendanceError;

    const subjectAverages = computeSubjectAverages(marksEntries);
    const { weak, strong } = partitionSubjectsByThreshold(subjectAverages, 70);
    const overallAverage = averageMarkEntries(marksEntries);

    const presentCount = attendanceRecords.filter(
      (r) => r.status === "present",
    ).length;
    const absentCount = attendanceRecords.filter(
      (r) => r.status === "absent",
    ).length;
    const lateCount = attendanceRecords.filter((r) => r.status === "late").length;
    const excusedCount = attendanceRecords.filter(
      (r) => r.status === "excused",
    ).length;

    const attendanceByDate: Record<string, AttendanceRecord["status"]> = {};
    for (const record of attendanceRecords) {
      attendanceByDate[record.date] = record.status;
    }

    const examHistory = [...marksEntries].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const allSubjects = new Set(subjectAverages.map((s) => s.subject));
    const { data: trend } = buildChartData(marksEntries, allSubjects);
    const trendFromUtil = buildTrendChartData(marksEntries);
    const trendSubjects = [
      ...new Set(
        trendFromUtil.flatMap((row) =>
          Object.keys(row).filter((k) => k !== "date" && k !== "label"),
        ),
      ),
    ].sort();

    return {
      overallAverage,
      subjectAverages,
      strongSubjects: strong,
      weakSubjects: weak,
      weakSubjectCount: weak.length,
      attendanceRate: calculateAttendancePercent(attendanceRecords),
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceByDate,
      examHistory,
      trend,
      trendSubjects,
      performanceBadge: getPerformanceBadge(overallAverage),
      marksEntries,
      attendanceRecords,
      loading,
      error,
    };
  }, [
    marksEntries,
    attendanceRecords,
    marksLoading,
    attendanceLoading,
    marksError,
    attendanceError,
  ]);
}
