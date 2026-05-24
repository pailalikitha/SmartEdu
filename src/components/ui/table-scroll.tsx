import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TableScrollProps = {
  children: ReactNode;
  className?: string;
  minWidth?: number;
};

export function TableScroll({
  children,
  className,
  minWidth = 600,
}: TableScrollProps) {
  return (
    <div
      className={cn("table-scroll -mx-1 px-1 sm:mx-0 sm:px-0", className)}
      style={{ ["--table-min-width" as string]: `${minWidth}px` }}
    >
      {children}
    </div>
  );
}
