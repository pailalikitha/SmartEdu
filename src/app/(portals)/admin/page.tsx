"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "Principal";

  return <AdminDashboard displayName={displayName} />;
}
