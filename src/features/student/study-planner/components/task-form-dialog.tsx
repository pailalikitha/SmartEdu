"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, FormField, Label } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/features/student/study-planner/schemas/planner.schema";
import { SUBJECT_OPTIONS } from "@/types/study-planner";
import type { StudyTask } from "@/types/study-planner";
import { toDateString } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  task?: StudyTask | null;
  defaultDate?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

const defaultValues: TaskFormValues = {
  title: "",
  subject: "Mathematics",
  topic: "",
  scheduledDate: toDateString(new Date()),
  startTime: "09:00",
  durationMinutes: 45,
  priority: "medium",
  notes: "",
};

function taskToForm(task: StudyTask): TaskFormValues {
  return {
    title: task.title,
    subject: task.subject,
    topic: task.topic,
    scheduledDate: task.scheduledDate,
    startTime: task.startTime ?? "",
    durationMinutes: task.durationMinutes,
    priority: task.priority,
    notes: task.notes ?? "",
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  task,
  defaultDate,
  isSubmitting = false,
  onSubmit,
}: TaskFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      ...defaultValues,
      scheduledDate: defaultDate ?? defaultValues.scheduledDate,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && task) {
      reset(taskToForm(task));
    } else {
      reset({
        ...defaultValues,
        scheduledDate: defaultDate ?? defaultValues.scheduledDate,
      });
    }
  }, [open, mode, task, defaultDate, reset]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "add" ? "Add task" : "Edit task"}
      description="Schedule a study block for your week."
      size="lg"
      className="sm:max-w-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            size="sm"
            isLoading={isSubmitting}
          >
            {mode === "add" ? "Add task" : "Save"}
          </Button>
        </>
      }
    >
      <form
        id="task-form"
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          label="Title"
          error={errors.title?.message}
          {...register("title")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm",
                errors.subject && "border-destructive",
              )}
              {...register("subject")}
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Topic"
            error={errors.topic?.message}
            {...register("topic")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Date"
            type="date"
            error={errors.scheduledDate?.message}
            {...register("scheduledDate")}
          />
          <FormField
            label="Start time"
            type="time"
            error={errors.startTime?.message}
            {...register("startTime")}
          />
          <FormField
            label="Duration (min)"
            type="number"
            error={errors.durationMinutes?.message}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            {...register("priority")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            rows={2}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
            {...register("notes")}
          />
        </div>
      </form>
    </Modal>
  );
}

export function formValuesToTaskInput(
  values: TaskFormValues,
  studentId: string,
): Omit<import("@/types/study-planner").StudyTaskInput, "status" | "source"> & {
  studentId: string;
} {
  return {
    studentId,
    title: values.title.trim(),
    subject: values.subject,
    topic: values.topic.trim(),
    scheduledDate: values.scheduledDate,
    startTime: values.startTime || undefined,
    durationMinutes: values.durationMinutes,
    priority: values.priority,
    notes: values.notes?.trim() || undefined,
  };
}
