"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ResponsiveTab<T extends string> = {
  id: T;
  label: string;
  shortLabel?: string;
  icon?: LucideIcon;
};

type ResponsiveTabsProps<T extends string> = {
  tabs: ResponsiveTab<T>[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
};

export function ResponsiveTabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  className,
}: ResponsiveTabsProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            "flex min-w-[4.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:min-w-0 sm:gap-2 sm:px-3",
            active === id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
          <span className="sm:hidden">{shortLabel ?? label}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
