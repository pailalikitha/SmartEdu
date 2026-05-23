"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/modal";
import { formatDayLabel, getWeekDates, toDateString } from "@/lib/utils/date";
import type { StudyTask, TaskPriority } from "@/types/study-planner";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "border-l-destructive",
  medium: "border-l-primary",
  low: "border-l-muted-foreground/40",
};

type WeeklyScheduleProps = {
  weekStart: Date;
  tasksByDate: Map<string, StudyTask[]>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  weekLabel: string;
  onAddTask: (date: string) => void;
  onEditTask: (task: StudyTask) => void;
  onDeleteTask: (task: StudyTask) => void;
  onToggleComplete: (task: StudyTask) => void;
  onStartTask: (task: StudyTask) => void;
  isSubmitting?: boolean;
};

function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onStart,
}: {
  task: StudyTask;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onStart: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        "border-l-[3px]",
        PRIORITY_STYLES[task.priority],
        task.status === "completed" && "opacity-60",
      )}
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          checked={task.status === "completed"}
          onChange={onToggleComplete}
          className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
          aria-label={`Mark ${task.title} complete`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium text-foreground",
              task.status === "completed" && "line-through",
            )}
          >
            {task.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {task.subject} · {task.topic}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {task.startTime ? (
              <span className="text-xs text-muted-foreground">
                {task.startTime} · {task.durationMinutes}m
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {task.durationMinutes} min
              </span>
            )}
            {task.source === "ai" ? (
              <Badge variant="accent" className="text-[0.65rem]">
                AI
              </Badge>
            ) : null}
            {task.status === "in_progress" ? (
              <Badge variant="warning">In progress</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-0.5">
          {task.status !== "completed" && task.status !== "in_progress" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onStart}
              aria-label="Start task"
            >
              <Play className="size-3.5" />
            </Button>
          ) : null}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Task actions"
            >
              <MoreVertical className="size-3.5" />
            </Button>
            {menuOpen ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute top-full right-0 z-20 mt-1 w-32 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeeklySchedule({
  weekStart,
  tasksByDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  weekLabel,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onStartTask,
}: WeeklyScheduleProps) {
  const weekDates = getWeekDates(weekStart);
  const today = toDateString(new Date());
  const [deleteTarget, setDeleteTarget] = useState<StudyTask | null>(null);

  const hasTasks = weekDates.some(
    (d) => (tasksByDate.get(toDateString(d))?.length ?? 0) > 0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button variant="outline" size="icon-sm" onClick={onPrevWeek} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Calendar className="size-4 text-primary" aria-hidden />
            <span className="truncate text-xs font-medium sm:text-sm">{weekLabel}</span>
          </div>
          <Button variant="outline" size="icon-sm" onClick={onNextWeek} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={onToday}>
          This week
        </Button>
      </div>

      {!hasTasks ? (
        <EmptyState
          title="No tasks this week"
          description="Generate an AI plan or add tasks manually to build your schedule."
          actionLabel="Add task"
          onAction={() => onAddTask(today)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
          {weekDates.map((date) => {
            const dateStr = toDateString(date);
            const dayTasks = tasksByDate.get(dateStr) ?? [];
            const isToday = dateStr === today;

            return (
              <div key={dateStr} className="min-w-0">
                <div
                  className={cn(
                    "mb-2 flex items-center justify-between rounded-lg px-2 py-1.5",
                    isToday ? "bg-primary/10" : "bg-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {formatDayLabel(date)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={() => onAddTask(dateStr)}
                    aria-label={`Add task on ${formatDayLabel(date)}`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-6 text-center">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                      </CardContent>
                    </Card>
                  ) : (
                    dayTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => setDeleteTarget(task)}
                        onToggleComplete={() => onToggleComplete(task)}
                        onStart={() => onStartTask(task)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete task"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from your schedule?`
            : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) onDeleteTask(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
