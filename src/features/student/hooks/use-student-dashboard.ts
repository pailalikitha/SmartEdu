"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchStudentDashboardData } from "@/services/student-dashboard.service";
import type { StudentDashboardData } from "@/types/student-dashboard";

const EMPTY_DASHBOARD: StudentDashboardData = {
  overallPerformance: null,
  weakTopicsCount: null,
  attendancePercent: null,
  subjectAverages: [],
  activities: [],
};

export function useStudentDashboard(studentId: string | undefined) {
  const [data, setData] = useState<StudentDashboardData>(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) {
      setData(EMPTY_DASHBOARD);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStudentDashboardData(studentId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard.",
      );
      setData(EMPTY_DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
