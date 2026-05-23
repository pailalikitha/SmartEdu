import { AuthGuard } from "@/components/auth/auth-guard";
import { NotificationsShell } from "@/components/layout/notifications-shell";
import { ToastProvider } from "@/components/ui/toast";
import { USER_ROLES } from "@/constants/roles";
import { NotificationsPage } from "@/features/notifications/components/notifications-page";

export default function NotificationsRoutePage() {
  return (
    <AuthGuard
      allowedRoles={[
        USER_ROLES.student,
        USER_ROLES.teacher,
        USER_ROLES.principal,
        USER_ROLES.parent,
      ]}
    >
      <ToastProvider>
        <NotificationsShell>
          <NotificationsPage />
        </NotificationsShell>
      </ToastProvider>
    </AuthGuard>
  );
}
