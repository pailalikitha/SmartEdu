"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui/toast";
import { USER_ROLES } from "@/constants/roles";
import { PARENT_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useParentChildrenSnapshot } from "@/hooks/use-parent-children-snapshot";
import { useAuth } from "@/hooks/use-auth";

function ParentPortalInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useParentChildrenSnapshot(user?.email);

  return (
    <DashboardShell
      navItems={PARENT_NAV}
      portalLabel="Parent Portal"
      portalRoot={ROUTES.parent.root}
      portalRole={USER_ROLES.parent}
    >
      {children}
    </DashboardShell>
  );
}

export default function ParentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[USER_ROLES.parent]}>
      <ToastProvider>
        <ParentPortalInner>{children}</ParentPortalInner>
      </ToastProvider>
    </AuthGuard>
  );
}
