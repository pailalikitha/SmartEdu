"use client";

import type { ComponentProps, ReactNode } from "react";

import { useChartHeight } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ChartSurfaceProps = ComponentProps<"div"> & {
  children: ReactNode;
  /** Override detected height (e.g. compact donut). */
  height?: number;
};

export function ChartSurface({
  children,
  className,
  height: heightOverride,
  style,
  ...props
}: ChartSurfaceProps) {
  const detected = useChartHeight();
  const height = heightOverride ?? detected;

  return (
    <div
      className={cn("chart-surface w-full min-w-0", className)}
      style={{ height, minHeight: height, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
