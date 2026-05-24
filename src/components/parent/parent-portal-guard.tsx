"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { useParentContext } from "@/contexts/parent-context";


export function ParentPortalGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { children: linkedChildren, selectedStudentId } = useParentContext();

  const needsSelection =
    linkedChildren.length > 1 &&
    !selectedStudentId &&
    pathname !== ROUTES.parent.selectChild;

  useEffect(() => {
    if (needsSelection) {
      router.replace(ROUTES.parent.selectChild);
    }
  }, [needsSelection, router]);

  if (linkedChildren.length === 0) {
    return <>{children}</>;
  }

  if (needsSelection) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
