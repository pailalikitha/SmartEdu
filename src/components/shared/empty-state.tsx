import type { ReactNode } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border",
        "bg-surface-muted/50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-brand-blue opacity-80">{icon}</div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
