"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchTeacherDashboardData } from "@/services/teacher-dashboard.service";
import type { TeacherDashboardData } from "@/types/teacher-dashboard";

const EMPTY_DASHBOARD: TeacherDashboardData = {
  totalClasses: 0,
  studentCount: 0,
  classAverage: null,
  classPerformance: [],
  hasMarks: false,
};

export function useTeacherDashboard(teacherId: string | undefined) {
  const [data, setData] = useState<TeacherDashboardData>(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!teacherId) {
      setData(EMPTY_DASHBOARD);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTeacherDashboardData(teacherId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard.",
      );
      setData(EMPTY_DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
