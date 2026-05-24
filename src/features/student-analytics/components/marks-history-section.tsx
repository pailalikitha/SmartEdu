"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  filterMarkEntries,
  getUniqueExamTypes,
  getUniqueSubjects,
} from "@/features/student/marks/utils/marks-stats";
import { getPercentageColorClass } from "@/features/student-analytics/utils/performance";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { MarksFilters, StudentMarkEntry } from "@/types/student-marks";

const PAGE_SIZE = 10;

type MarksHistorySectionProps = {
  entries: StudentMarkEntry[];
};

export function MarksHistorySection({ entries }: MarksHistorySectionProps) {
  const [filters, setFilters] = useState<MarksFilters>({
    subject: "all",
    examType: "all",
    startDate: "",
    endDate: "",
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const subjects = useMemo(() => getUniqueSubjects(entries), [entries]);
  const examTypes = useMemo(() => getUniqueExamTypes(entries), [entries]);

  const filtered = useMemo(
    () => filterMarkEntries(entries, filters),
    [entries, filters],
  );

  const visible = filtered.slice(0, visibleCount);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marks history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No exam records yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marks history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="dashboard-stats-grid">
          <div className="space-y-1">
            <Label htmlFor="mh-subject">Subject</Label>
            <select
              id="mh-subject"
              className="flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm"
              value={filters.subject}
              onChange={(e) => {
                setFilters((f) => ({ ...f, subject: e.target.value }));
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">All</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="mh-exam">Exam type</Label>
            <select
              id="mh-exam"
              className="flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm"
              value={filters.examType}
              onChange={(e) => {
                setFilters((f) => ({ ...f, examType: e.target.value }));
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">All</option>
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-scroll rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                {["Date", "Subject", "Exam", "Marks", "Total", "%", "Grade"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2">{formatDate(row.date)}</td>
                  <td className="px-3 py-2">{row.subject}</td>
                  <td className="px-3 py-2">{row.examType}</td>
                  <td className="px-3 py-2">{row.marksObtained}</td>
                  <td className="px-3 py-2">{row.totalMarks}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-medium",
                      getPercentageColorClass(row.percentage),
                    )}
                  >
                    {row.percentage}%
                  </td>
                  <td className="px-3 py-2">{row.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleCount < filtered.length ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
