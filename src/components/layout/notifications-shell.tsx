"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NAV_BY_ROLE } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";

export function NotificationsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.role ?? "student";
  const navItems = NAV_BY_ROLE[role];
  const portalRoot =
    role === "admin" || role === "principal"
      ? ROUTES.admin.root
      : role === "teacher"
        ? ROUTES.teacher.root
        : role === "parent"
          ? ROUTES.parent.root
          : ROUTES.student.root;

  return (
    <DashboardShell
      navItems={navItems}
      portalLabel="SmartEdu"
      portalRoot={portalRoot}
      portalRole={role}
      title="Notifications"
    >
      {children}
    </DashboardShell>
  );
}
