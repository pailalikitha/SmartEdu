"use client";

import { PasswordChangeModal } from "@/components/auth/password-change-modal";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfileSnapshot } from "@/hooks/use-user-profile-snapshot";

export function PortalPasswordGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfileSnapshot(user?.id);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  const mustChange = profile?.passwordChanged === false;

  if (mustChange) {
    return <PasswordChangeModal />;
  }

  return <>{children}</>;
}
