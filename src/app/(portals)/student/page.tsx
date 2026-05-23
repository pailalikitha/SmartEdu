"use client";

import { StudentDashboard } from "@/components/dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "Student";

  return <StudentDashboard displayName={displayName} />;
}
