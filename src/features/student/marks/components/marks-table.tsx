"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent, Label } from "@/components/ui";
import {
  filterMarkEntries,
  getUniqueExamTypes,
  getUniqueSubjects,
  sortMarkEntries,
} from "@/features/student/marks/utils/marks-stats";
import { formatDate } from "@/lib/utils/format";
import type {
  MarksFilters,
  MarksSortDirection,
  MarksSortKey,
  StudentMarkEntry,
} from "@/types/student-marks";
import { cn } from "@/lib/utils";

const COLUMNS: { key: MarksSortKey; label: string }[] = [
  { key: "subject", label: "Subject" },
  { key: "examType", label: "Exam Type" },
  { key: "marksObtained", label: "Marks" },
  { key: "totalMarks", label: "Total" },
  { key: "percentage", label: "Percentage" },
  { key: "grade", label: "Grade" },
  { key: "date", label: "Date" },
];

type MarksTableProps = {
  entries: StudentMarkEntry[];
};

export function MarksTable({ entries }: MarksTableProps) {
  const [filters, setFilters] = useState<MarksFilters>({
    subject: "all",
    examType: "all",
    startDate: "",
    endDate: "",
  });
  const [sortKey, setSortKey] = useState<MarksSortKey>("date");
  const [sortDir, setSortDir] = useState<MarksSortDirection>("desc");

  const subjects = useMemo(() => getUniqueSubjects(entries), [entries]);
  const examTypes = useMemo(() => getUniqueExamTypes(entries), [entries]);

  const filtered = useMemo(
    () => sortMarkEntries(filterMarkEntries(entries, filters), sortKey, sortDir),
    [entries, filters, sortKey, sortDir],
  );

  const toggleSort = (key: MarksSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ column }: { column: MarksSortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5" aria-hidden />
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-subject">Subject</Label>
            <select
              id="filter-subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters((f) => ({ ...f, subject: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-exam">Exam type</Label>
            <select
              id="filter-exam"
              value={filters.examType}
              onChange={(e) =>
                setFilters((f) => ({ ...f, examType: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            >
              <option value="all">All types</option>
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-start">From</Label>
            <input
              id="filter-start"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-end">To</Label>
            <input
              id="filter-end"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            />
          </div>
        </div>

        <div className="table-scroll rounded-lg border border-border">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-muted/40">
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th key={key} className="px-3 py-2 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="inline-flex items-center gap-1 font-medium hover:text-primary"
                    >
                      {label}
                      <SortIcon column={key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No marks match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border/60 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium">{row.subject}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.examType}
                    </td>
                    <td className="px-3 py-2">{row.marksObtained}</td>
                    <td className="px-3 py-2">{row.totalMarks}</td>
                    <td className="px-3 py-2 font-medium">
                      {row.percentage}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          row.percentage >= 60
                            ? "bg-success/15 text-success"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {formatDate(row.date, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
