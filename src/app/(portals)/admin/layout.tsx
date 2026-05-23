import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout";
import { USER_ROLES } from "@/constants/roles";
import { ADMIN_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[USER_ROLES.principal]}>
      <DashboardShell
        navItems={ADMIN_NAV}
        portalLabel="Admin Portal"
        portalRoot={ROUTES.admin.root}
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
