"use client";

import { useTeacherDashboardSnapshot } from "@/hooks/use-teacher-dashboard-snapshot";

export function useTeacherDashboard(teacherId: string | undefined) {
  const { data, isLoading, error } = useTeacherDashboardSnapshot(teacherId);
  return { data, isLoading, error };
}
