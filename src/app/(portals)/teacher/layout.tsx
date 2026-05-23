import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout";
import { USER_ROLES } from "@/constants/roles";
import { TEACHER_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export default function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[USER_ROLES.teacher]}>
      <DashboardShell
        navItems={TEACHER_NAV}
        portalLabel="Teacher Portal"
        portalRoot={ROUTES.teacher.root}
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
