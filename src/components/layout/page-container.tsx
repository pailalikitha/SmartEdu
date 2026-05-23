import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /** default: 7xl — use 6xl for marketing-aligned pages */
  size?: "6xl" | "7xl" | "full";
};

const sizeClasses = {
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const;

export function PageContainer({
  children,
  className,
  size = "7xl",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
