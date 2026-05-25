import type { StudentMarkEntry } from "@/types/student-marks";

export type SubjectAverage = {
  subject: string;
  average: number;
  totalObtained: number;
  totalMax: number;
};

const WEAK_THRESHOLD = 60;

export function computeSubjectAverages(
  entries: StudentMarkEntry[],
): SubjectAverage[] {
  const bySubject = new Map<string, { obtained: number; max: number }>();

  for (const entry of entries) {
    const current = bySubject.get(entry.subject) ?? { obtained: 0, max: 0 };
    current.obtained += entry.marksObtained;
    current.max += entry.totalMarks;
    bySubject.set(entry.subject, current);
  }

  return Array.from(bySubject.entries())
    .map(([subject, { obtained, max }]) => ({
      subject,
      totalObtained: obtained,
      totalMax: max,
      average:
        max > 0 ? Math.round((obtained / max) * 1000) / 10 : 0,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

export function partitionSubjectsByThreshold(
  subjects: SubjectAverage[],
  threshold = WEAK_THRESHOLD,
) {
  const weak = subjects.filter((s) => s.average < threshold);
  const strong = subjects.filter((s) => s.average >= threshold);
  return { weak, strong };
}

export function overallAverageFromSubjects(
  subjects: SubjectAverage[],
): number | null {
  if (subjects.length === 0) return null;
  const sum = subjects.reduce((acc, s) => acc + s.average, 0);
  return Math.round((sum / subjects.length) * 10) / 10;
}

export function subjectReadinessLabel(average: number): string {
  if (average >= 71) return "Ready";
  if (average >= 41) return "Almost Ready";
  return "Needs Work";
}

export function examReadinessLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 91) return { label: "Exam Ready!", color: "var(--success)" };
  if (score >= 71) return { label: "Almost Ready", color: "var(--warning)" };
  if (score >= 41) return { label: "Getting There", color: "var(--warning)" };
  return { label: "Not Ready", color: "var(--destructive)" };
}
