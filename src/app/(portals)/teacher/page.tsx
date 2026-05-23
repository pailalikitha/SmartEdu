"use client";

import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "Teacher";

  return <TeacherDashboard displayName={displayName} />;
}
