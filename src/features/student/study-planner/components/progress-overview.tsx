"use client";

import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { PlannerProgress } from "@/features/student/study-planner/utils/planner-stats";
import { cn } from "@/lib/utils";

type SubjectProgress = {
  subject: string;
  total: number;
  completed: number;
  rate: number;
};

type ProgressOverviewProps = {
  progress: PlannerProgress;
  subjectProgress: SubjectProgress[];
};

export function ProgressOverview({
  progress,
  subjectProgress,
}: ProgressOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Completion"
          value={`${progress.completionRate}%`}
          change={`${progress.completed} of ${progress.total} tasks`}
          trend={progress.completionRate >= 50 ? "up" : "neutral"}
          icon={Target}
          accent="blue"
        />
        <StatCard
          title="Completed"
          value={String(progress.completed)}
          change={`${progress.pending} pending`}
          trend="up"
          icon={CheckCircle2}
          accent="blue"
        />
        <StatCard
          title="Study time"
          value={progress.studiedHoursLabel}
          change={`${Math.round(progress.plannedMinutes / 60)}h planned`}
          trend="neutral"
          icon={Clock}
          accent="yellow"
        />
        <StatCard
          title="In progress"
          value={String(progress.inProgress)}
          change="Active sessions"
          trend="neutral"
          icon={BookOpen}
          accent="yellow"
        />
      </div>

      {subjectProgress.length > 0 ? (
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base">Subject progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {subjectProgress.map(({ subject, completed, total, rate }) => (
              <div key={subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{subject}</span>
                  <span className="text-muted-foreground">
                    {completed}/{total} · {rate}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      rate >= 75
                        ? "bg-success"
                        : rate >= 40
                          ? "bg-primary"
                          : "bg-warning",
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
