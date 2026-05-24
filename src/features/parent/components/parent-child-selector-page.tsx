"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { useParentContext } from "@/contexts/parent-context";
import { useParentChildrenSnapshot } from "@/hooks/use-parent-children-snapshot";
import { useUserProfileSnapshot } from "@/hooks/use-user-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { getStudentClassLabel, getStudentFullName } from "@/types/student";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ParentChildSelectorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfileSnapshot(user?.id);
  const { isLoading, error } = useParentChildrenSnapshot(user?.id, profile);
  const { children, setSelectedStudentId } = useParentContext();

  const pickChild = (studentId: string) => {
    setSelectedStudentId(studentId);
    router.push(ROUTES.parent.dashboard);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading children" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">No linked students</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact your school if you expected to see a child linked to your account.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && children.length === 1) {
      const id = children[0].uid ?? children[0].authUserId ?? children[0].id;
      setSelectedStudentId(id);
      router.replace(ROUTES.parent.dashboard);
    }
  }, [isLoading, children, setSelectedStudentId, router]);

  if (!isLoading && children.length === 1) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Opening dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Select a child"
        description="Choose which child's progress you want to view."
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => {
          const id = child.uid ?? child.authUserId ?? child.id;
          return (
            <Card key={child.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(getStudentFullName(child))}
                  </div>
                  <div>
                    <p className="font-semibold">{getStudentFullName(child)}</p>
                    <p className="text-sm text-muted-foreground">
                      {getStudentClassLabel(child)}
                    </p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => pickChild(id)}>
                  View dashboard
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        You can switch children anytime from the dashboard header.
      </p>
    </div>
  );
}
