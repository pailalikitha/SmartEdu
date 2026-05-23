import { getWeekDates, toDateString } from "@/lib/utils/date";
import type { StudyTask } from "@/types/study-planner";

export function filterTasksForWeek(
  tasks: StudyTask[],
  weekStart: Date,
): StudyTask[] {
  const dates = new Set(getWeekDates(weekStart).map(toDateString));
  return tasks.filter((t) => dates.has(t.scheduledDate));
}

export function groupTasksByDate(tasks: StudyTask[]): Map<string, StudyTask[]> {
  const map = new Map<string, StudyTask[]>();
  for (const task of tasks) {
    const list = map.get(task.scheduledDate) ?? [];
    list.push(task);
    map.set(task.scheduledDate, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }
  return map;
}

export type PlannerProgress = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
  plannedMinutes: number;
  completedMinutes: number;
  studiedHoursLabel: string;
};

export function computeProgress(tasks: StudyTask[]): PlannerProgress {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const plannedMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const completedMinutes = tasks
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + t.durationMinutes, 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const studiedHours = (completedMinutes / 60).toFixed(1);

  return {
    total,
    completed,
    inProgress,
    pending,
    completionRate,
    plannedMinutes,
    completedMinutes,
    studiedHoursLabel: `${studiedHours}h`,
  };
}

export function getSubjectProgress(tasks: StudyTask[]) {
  const bySubject = new Map<string, { total: number; completed: number }>();

  for (const task of tasks) {
    const current = bySubject.get(task.subject) ?? { total: 0, completed: 0 };
    current.total += 1;
    if (task.status === "completed") current.completed += 1;
    bySubject.set(task.subject, current);
  }

  return Array.from(bySubject.entries())
    .map(([subject, { total, completed }]) => ({
      subject,
      total,
      completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
}
