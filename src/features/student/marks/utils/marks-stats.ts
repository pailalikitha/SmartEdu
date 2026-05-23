import type {
  MarksFilters,
  MarksSortDirection,
  MarksSortKey,
  MarksSummary,
  StudentMarkEntry,
} from "@/types/student-marks";

export function computeMarksSummary(entries: StudentMarkEntry[]): MarksSummary | null {
  if (entries.length === 0) return null;

  const overallAverage =
    entries.reduce((sum, e) => sum + e.percentage, 0) / entries.length;

  const bySubject = new Map<string, { sum: number; count: number }>();
  for (const entry of entries) {
    const current = bySubject.get(entry.subject) ?? { sum: 0, count: 0 };
    current.sum += entry.percentage;
    current.count += 1;
    bySubject.set(entry.subject, current);
  }

  const subjectAverages = Array.from(bySubject.entries()).map(
    ([name, { sum, count }]) => ({
      name,
      average: sum / count,
    }),
  );

  const sorted = [...subjectAverages].sort((a, b) => b.average - a.average);

  return {
    overallAverage: Math.round(overallAverage * 10) / 10,
    bestSubject: sorted[0] ?? null,
    weakestSubject: sorted[sorted.length - 1] ?? null,
    totalExams: entries.length,
  };
}

export function getUniqueSubjects(entries: StudentMarkEntry[]): string[] {
  return [...new Set(entries.map((e) => e.subject))].sort();
}

export function getUniqueExamTypes(entries: StudentMarkEntry[]): string[] {
  return [...new Set(entries.map((e) => e.examType))].sort();
}

export function filterMarkEntries(
  entries: StudentMarkEntry[],
  filters: MarksFilters,
): StudentMarkEntry[] {
  return entries.filter((entry) => {
    if (filters.subject !== "all" && entry.subject !== filters.subject) {
      return false;
    }
    if (filters.examType !== "all" && entry.examType !== filters.examType) {
      return false;
    }
    if (filters.startDate && entry.date < filters.startDate) return false;
    if (filters.endDate && entry.date > filters.endDate) return false;
    return true;
  });
}

const GRADE_ORDER: Record<string, number> = {
  "A+": 7,
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  F: 2,
};

export function sortMarkEntries(
  entries: StudentMarkEntry[],
  key: MarksSortKey,
  direction: MarksSortDirection,
): StudentMarkEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "subject":
        cmp = a.subject.localeCompare(b.subject);
        break;
      case "examType":
        cmp = a.examType.localeCompare(b.examType);
        break;
      case "marksObtained":
        cmp = a.marksObtained - b.marksObtained;
        break;
      case "totalMarks":
        cmp = a.totalMarks - b.totalMarks;
        break;
      case "percentage":
        cmp = a.percentage - b.percentage;
        break;
      case "grade":
        cmp =
          (GRADE_ORDER[a.grade] ?? 0) - (GRADE_ORDER[b.grade] ?? 0);
        break;
      case "date":
        cmp = a.date.localeCompare(b.date);
        break;
      default:
        cmp = 0;
    }
    return direction === "asc" ? cmp : -cmp;
  });

  return sorted;
}

export type ChartRow = {
  date: string;
  label: string;
  [subject: string]: string | number;
};

const CHART_COLORS = [
  "#6ba3d4",
  "#d97706",
  "#16a34a",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

export function getSubjectColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Pivot entries into recharts-friendly rows keyed by date. */
export function buildChartData(
  entries: StudentMarkEntry[],
  visibleSubjects: Set<string>,
): { data: ChartRow[]; subjects: string[] } {
  const subjects = getUniqueSubjects(entries).filter((s) =>
    visibleSubjects.has(s),
  );

  const dateMap = new Map<string, ChartRow>();

  for (const entry of entries) {
    if (!visibleSubjects.has(entry.subject)) continue;

    const row = dateMap.get(entry.date) ?? {
      date: entry.date,
      label: entry.date,
    };
    row[entry.subject] = entry.percentage;
    dateMap.set(entry.date, row);
  }

  const data = Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  return { data, subjects };
}
