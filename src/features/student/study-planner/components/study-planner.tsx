"use client";

import { CalendarDays, ListTodo, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTabs } from "@/components/layout/responsive-tabs";
import { Button } from "@/components/ui";
import { ProgressOverview } from "@/features/student/study-planner/components/progress-overview";
import { TaskFormDialog, formValuesToTaskInput } from "@/features/student/study-planner/components/task-form-dialog";
import { TaskGeneratorPanel } from "@/features/student/study-planner/components/task-generator-panel";
import { WeeklySchedule } from "@/features/student/study-planner/components/weekly-schedule";
import { useStudyPlanner } from "@/features/student/study-planner/hooks/use-study-planner";
import type { TaskFormValues } from "@/features/student/study-planner/schemas/planner.schema";
import { useAuth } from "@/hooks/use-auth";
import { formatWeekLabel, toDateString } from "@/lib/utils/date";
import type { StudyTask } from "@/types/study-planner";

const TABS = [
  { id: "schedule" as const, label: "Schedule", shortLabel: "Schedule", icon: CalendarDays },
  { id: "progress" as const, label: "Progress", shortLabel: "Progress", icon: TrendingUp },
  { id: "generate" as const, label: "AI planner", shortLabel: "AI", icon: ListTodo },
];

export function StudyPlanner() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"schedule" | "progress" | "generate">("schedule");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
  const [defaultDate, setDefaultDate] = useState(() => toDateString(new Date()));

  const planner = useStudyPlanner(user?.id);

  const openAdd = (date?: string) => {
    setFormMode("add");
    setSelectedTask(null);
    setDefaultDate(date ?? toDateString(new Date()));
    setFormOpen(true);
  };

  const openEdit = (task: StudyTask) => {
    setFormMode("edit");
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: TaskFormValues) => {
    if (!user?.id) return;

    const base = formValuesToTaskInput(values, user.id);

    if (formMode === "add") {
      await planner.addTask({
        ...base,
        status: "pending",
        source: "manual",
      });
    } else if (selectedTask) {
      await planner.editTask(selectedTask.id, base);
    }
  };

  const handleGenerate = async (
    input: Parameters<typeof planner.generatePlan>[0],
  ) => {
    await planner.generatePlan(input);
    setTab("schedule");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study planner"
        description="AI-generated tasks, weekly schedule, and progress tracking."
        action={
          <Button onClick={() => openAdd()} className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden />
            Add task
          </Button>
        }
      />

      <ResponsiveTabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        ariaLabel="Study planner sections"
      />

      {planner.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {planner.error}
        </div>
      ) : null}

      {planner.isLoading ? (
        <div className="flex justify-center py-20">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading planner"
          />
        </div>
      ) : (
        <div role="tabpanel">
          {tab === "generate" ? (
            <TaskGeneratorPanel
              onGenerate={handleGenerate}
              isSubmitting={planner.isSubmitting}
            />
          ) : null}

          {tab === "progress" ? (
            <ProgressOverview
              progress={planner.progress}
              subjectProgress={planner.subjectProgress}
            />
          ) : null}

          {tab === "schedule" ? (
            <WeeklySchedule
              weekStart={planner.weekStart}
              tasksByDate={planner.tasksByDate}
              weekLabel={formatWeekLabel(planner.weekStart)}
              onPrevWeek={planner.goToPrevWeek}
              onNextWeek={planner.goToNextWeek}
              onToday={planner.goToCurrentWeek}
              onAddTask={openAdd}
              onEditTask={openEdit}
              onDeleteTask={(t) => void planner.removeTask(t.id)}
              onToggleComplete={(t) => void planner.toggleComplete(t)}
              onStartTask={(t) => void planner.setInProgress(t)}
            />
          ) : null}
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        task={selectedTask}
        defaultDate={defaultDate}
        isSubmitting={planner.isSubmitting}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
