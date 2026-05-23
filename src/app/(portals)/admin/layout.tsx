import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui/toast";
import { ADMIN_ROLES } from "@/constants/roles";
import { ADMIN_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={ADMIN_ROLES}>
      <ToastProvider>
        <DashboardShell
          navItems={ADMIN_NAV}
          portalLabel="Admin Portal"
          portalRoot={ROUTES.admin.root}
        >
          {children}
        </DashboardShell>
      </ToastProvider>
    </AuthGuard>
  );
}
