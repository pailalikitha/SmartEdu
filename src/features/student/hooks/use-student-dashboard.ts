"use client";

import { useMemo } from "react";

import { useStudentAnalytics } from "@/hooks/use-student-analytics";
import { useStudentDashboardSnapshot } from "@/hooks/use-student-dashboard-snapshot";
import type { StudentDashboardData } from "@/types/student-dashboard";

export function useStudentDashboard(studentId: string | undefined) {
  const analytics = useStudentAnalytics(studentId);
  const { data: activityData, isLoading: activityLoading, error: activityError } =
    useStudentDashboardSnapshot(studentId);

  const data = useMemo((): StudentDashboardData => {
    return {
      overallPerformance: analytics.overallAverage,
      weakTopicsCount:
        analytics.marksEntries.length === 0
          ? null
          : analytics.weakSubjectCount,
      attendancePercent: analytics.attendanceRate,
      subjectAverages: analytics.subjectAverages.map((s) => ({
        label: s.subject,
        value: s.average,
      })),
      activities: activityData.activities,
    };
  }, [analytics, activityData.activities]);

  return {
    data,
    isLoading: analytics.loading || activityLoading,
    error: analytics.error ?? activityError,
  };
}
