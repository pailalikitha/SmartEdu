import { examReadinessLabel } from "@/lib/utils/subject-stats";

export function scoreFromTasks(tasks: { status: string }[]): number | null {
  if (tasks.length === 0) return null;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 1000) / 10;
}

export function computeReadinessScore(
  marksAvg: number | null,
  attendanceRate: number | null,
  taskCompletion: number | null,
): number | null {
  const parts: { value: number; weight: number }[] = [];
  if (marksAvg !== null) parts.push({ value: marksAvg, weight: 0.4 });
  if (attendanceRate !== null) parts.push({ value: attendanceRate, weight: 0.3 });
  if (taskCompletion !== null) parts.push({ value: taskCompletion, weight: 0.3 });
  if (parts.length === 0) return null;

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const weighted = parts.reduce((s, p) => s + p.value * p.weight, 0);
  return Math.round((weighted / totalWeight) * 10) / 10;
}

export function getReadinessMeta(score: number | null) {
  if (score === null) {
    return { label: "Not Ready", color: "var(--destructive)" };
  }
  const { label, color } = examReadinessLabel(score);
  return { label, color };
}
