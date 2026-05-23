"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useStudentAssignmentsSnapshot } from "@/hooks/use-student-assignments-snapshot";
import { formatDueCountdown, getDueUrgency, URGENCY_STYLES } from "@/lib/utils/assignment";
import { cn } from "@/lib/utils";

type UpcomingAssignmentsWidgetProps = {
  studentId: string | undefined;
  classId: string | undefined;
};

export function UpcomingAssignmentsWidget({
  studentId,
  classId,
}: UpcomingAssignmentsWidgetProps) {
  const { upcoming, isLoading } = useStudentAssignmentsSnapshot(studentId, classId);

  if (!classId) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-4" />
          Upcoming assignments
        </CardTitle>
        <Link href={ROUTES.student.assignments}>
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending assignments.</p>
        ) : (
          upcoming.map((task) => {
            const urgency = getDueUrgency(task.dueDate, task.hasSubmitted);
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.subject}</p>
                </div>
                <span className={cn("shrink-0 text-xs font-medium", URGENCY_STYLES[urgency].split(" ")[0])}>
                  {formatDueCountdown(task.dueDate)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
