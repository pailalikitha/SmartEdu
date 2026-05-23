import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui/toast";
import { USER_ROLES } from "@/constants/roles";
import { STUDENT_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[USER_ROLES.student]}>
      <ToastProvider>
        <DashboardShell
          navItems={STUDENT_NAV}
          portalLabel="Student Portal"
          portalRoot={ROUTES.student.root}
        >
          {children}
        </DashboardShell>
      </ToastProvider>
    </AuthGuard>
  );
}
