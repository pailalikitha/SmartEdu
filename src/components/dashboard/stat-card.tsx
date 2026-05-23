import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: "blue" | "yellow";
  showLive?: boolean;
};

const trendStyles = {
  up: "text-success bg-success/10",
  down: "text-destructive bg-destructive/10",
  neutral: "text-muted-foreground bg-muted",
} as const;

const TrendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
} as const;

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  accent = "blue",
  showLive = false,
}: StatCardProps) {
  const Trend = TrendIcon[trend];

  return (
    <Card
      accent={accent === "yellow" ? "yellow" : "blue"}
      className="group transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardContent className="pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {showLive ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  Live
                </span>
              ) : null}
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trendStyles[trend],
              )}
            >
              <Trend className="size-3.5 shrink-0" aria-hidden />
              {change}
            </span>
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
              accent === "yellow"
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
