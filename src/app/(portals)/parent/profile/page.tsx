"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

export default function ParentProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your parent account details." />
      <div className="grid max-w-lg gap-4">
        <FormField label="Name" value={user?.displayName ?? ""} readOnly />
        <FormField label="Email" value={user?.email ?? ""} readOnly />
      </div>
    </div>
  );
}
