import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed border-border bg-muted/40 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div
          className="flex size-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          aria-hidden
        >
          <Icon className="size-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
