"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalPasswordGuard } from "@/components/auth/portal-password-guard";
import { ParentPortalGuard } from "@/components/parent/parent-portal-guard";
import { DashboardShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui/toast";
import { USER_ROLES } from "@/constants/roles";
import { PARENT_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { ParentProvider } from "@/contexts/parent-context";
import { useParentChildrenSnapshot } from "@/hooks/use-parent-children-snapshot";
import { useUserProfileSnapshot } from "@/hooks/use-user-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";

function ParentPortalInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile } = useUserProfileSnapshot(user?.id);
  useParentChildrenSnapshot(user?.id, profile);

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
        <PortalPasswordGuard>
          <ParentProvider>
            <ParentPortalGuard>
              <ParentPortalInner>{children}</ParentPortalInner>
            </ParentPortalGuard>
          </ParentProvider>
        </PortalPasswordGuard>
      </ToastProvider>
    </AuthGuard>
  );
}
