"use client";

import { useStudentDashboardSnapshot } from "@/hooks/use-student-dashboard-snapshot";

export function useStudentDashboard(studentId: string | undefined) {
  const { data, isLoading, error } = useStudentDashboardSnapshot(studentId);
  return { data, isLoading, error };
}
