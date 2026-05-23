import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  type LucideIcon,
} from "lucide-react";

import { DashboardEmptyPlaceholder } from "@/components/dashboard/dashboard-empty-placeholder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ActivityType = "exam" | "alert" | "plan" | "achievement";

export type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: ActivityType;
};

const activityConfig: Record<
  ActivityType,
  { icon: LucideIcon; className: string }
> = {
  exam: { icon: BookOpen, className: "bg-secondary text-secondary-foreground" },
  alert: { icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
  plan: { icon: Calendar, className: "bg-accent text-accent-foreground" },
  achievement: { icon: Award, className: "bg-success/15 text-success" },
};

type RecentActivityProps = {
  activities: Activity[];
  className?: string;
  maxItems?: number;
};

export function RecentActivity({
  activities,
  className,
  maxItems,
}: RecentActivityProps) {
  const items = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest updates across your academics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {items.length === 0 ? (
          <div className="p-4">
            <DashboardEmptyPlaceholder minHeight="min-h-[12rem]" />
          </div>
        ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const { icon: Icon, className: iconClass } =
              activityConfig[item.type];

            return (
              <li
                key={item.id}
                className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:gap-4 sm:py-4"
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    iconClass,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <time className="shrink-0 self-start text-xs text-muted-foreground">
                  {item.time}
                </time>
              </li>
            );
          })}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}
