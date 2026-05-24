export type PerformanceBadge =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Help";

export function getPerformanceBadge(
  overallAverage: number | null,
): PerformanceBadge {
  if (overallAverage === null) return "Needs Help";
  if (overallAverage >= 85) return "Excellent";
  if (overallAverage >= 70) return "Good";
  if (overallAverage >= 50) return "Average";
  return "Needs Help";
}

export function getPerformanceBorderClass(overallAverage: number | null): string {
  if (overallAverage === null) return "border-border";
  if (overallAverage >= 75) return "border-success";
  if (overallAverage >= 50) return "border-warning";
  return "border-destructive";
}

export function getPercentageColorClass(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 75) return "text-success";
  if (value >= 50) return "text-warning";
  return "text-destructive";
}

export function computeClassRank(
  studentMarksId: string,
  peerAverages: Array<{ id: string; average: number | null }>,
): number | null {
  const ranked = peerAverages
    .filter((p) => p.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0));

  if (ranked.length === 0) return null;
  const index = ranked.findIndex((p) => p.id === studentMarksId);
  return index >= 0 ? index + 1 : null;
}
