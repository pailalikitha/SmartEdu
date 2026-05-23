"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { generateWeeklyStudyTasks } from "@/features/student/study-planner/utils/task-generator";
import type { GeneratePlanInput } from "@/features/student/study-planner/utils/task-generator";
import {
  computeProgress,
  getSubjectProgress,
  groupTasksByDate,
} from "@/features/student/study-planner/utils/planner-stats";
import { addWeeks, getWeekStart, toDateString } from "@/lib/utils/date";
import {
  createStudyTask,
  createStudyTasks,
  deleteStudyTask,
  listStudyTasksForWeek,
  toggleTaskComplete,
  updateStudyTask,
} from "@/services/study-planner.service";
import type { StudyTask, StudyTaskInput } from "@/types/study-planner";

export function useStudyPlanner(studentId: string | undefined) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!studentId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await listStudyTasksForWeek(
        studentId,
        toDateString(weekStart),
      );
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId, weekStart]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const weekTasks = tasks;

  const tasksByDate = useMemo(
    () => groupTasksByDate(weekTasks),
    [weekTasks],
  );

  const progress = useMemo(() => computeProgress(weekTasks), [weekTasks]);
  const subjectProgress = useMemo(
    () => getSubjectProgress(weekTasks),
    [weekTasks],
  );

  const goToPrevWeek = () => setWeekStart((w) => addWeeks(w, -1));
  const goToNextWeek = () => setWeekStart((w) => addWeeks(w, 1));
  const goToCurrentWeek = () => setWeekStart(getWeekStart());

  const generatePlan = useCallback(
    async (input: Omit<GeneratePlanInput, "studentId" | "weekStart">) => {
      if (!studentId) return;

      setIsSubmitting(true);
      setError(null);
      try {
        const generated = generateWeeklyStudyTasks({
          studentId,
          weekStart,
          ...input,
        });
        await createStudyTasks(
          generated.map((t) => ({ ...t, studentId })),
          toDateString(weekStart),
        );
        const data = await listStudyTasksForWeek(
          studentId,
          toDateString(weekStart),
        );
        setTasks(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate plan.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [studentId, weekStart],
  );

  const addTask = useCallback(
    async (input: Omit<StudyTaskInput, "studentId">) => {
      if (!studentId) return;

      setIsSubmitting(true);
      setError(null);
      try {
        const created = await createStudyTask({
          ...input,
          studentId,
          source: "manual",
          status: input.status ?? "pending",
        });
        setTasks((prev) => [...prev, created]);
        return created;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add task.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [studentId],
  );

  const editTask = useCallback(
    async (id: string, patch: Partial<StudyTaskInput>) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await updateStudyTask(id, patch);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update task.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const removeTask = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteStudyTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const toggleComplete = useCallback(async (task: StudyTask) => {
    try {
      const next = await toggleTaskComplete(task);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task status.",
      );
    }
  }, []);

  const setInProgress = useCallback(
    async (task: StudyTask) => {
      await editTask(task.id, { status: "in_progress" });
    },
    [editTask],
  );

  return {
    weekStart,
    weekTasks,
    tasksByDate,
    progress,
    subjectProgress,
    isLoading,
    isSubmitting,
    error,
    setError,
    refresh: loadTasks,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    generatePlan,
    addTask,
    editTask,
    removeTask,
    toggleComplete,
    setInProgress,
  };
}
