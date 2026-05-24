"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { useStudentStudyTasksSnapshot } from "@/hooks/use-student-study-tasks-snapshot";
import { toDateString } from "@/lib/utils/date";
import { toggleTaskComplete } from "@/services/study-planner.service";
import { cn } from "@/lib/utils";

type TodayStudyTasksProps = {
  studentId: string | undefined;
};

export function TodayStudyTasks({ studentId }: TodayStudyTasksProps) {
  const { toast } = useToast();
  const { tasks, isLoading } = useStudentStudyTasksSnapshot(studentId);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const today = toDateString(new Date());

  const todayTasks = tasks
    .filter((t) => t.scheduledDate === today)
    .slice(0, 8);

  const handleToggle = async (task: (typeof todayTasks)[0]) => {
    setTogglingId(task.id);
    try {
      await toggleTaskComplete(task);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not update task.",
        variant: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Today&apos;s study tasks</CardTitle>
        <Link href={ROUTES.student.studyPlanner}>
          <Button variant="ghost" size="sm">
            Planner
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : todayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks scheduled for today. Open the study planner to add some.
          </p>
        ) : (
          todayTasks.map((task) => (
            <label
              key={task.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2",
                task.status === "completed" && "bg-muted/40 opacity-80",
              )}
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={task.status === "completed"}
                disabled={togglingId === task.id}
                onChange={() => void handleToggle(task)}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.status === "completed" && "line-through",
                  )}
                >
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{task.subject}</p>
              </div>
            </label>
          ))
        )}
      </CardContent>
    </Card>
  );
}
