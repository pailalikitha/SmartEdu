"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { MarksEmptyState } from "@/features/student/marks/components/marks-empty-state";
import { MarksSummaryCards } from "@/features/student/marks/components/marks-summary-cards";
import { MarksTable } from "@/features/student/marks/components/marks-table";
import { MarksTrendChart } from "@/features/student/marks/components/marks-trend-chart";
import { useStudentMarks } from "@/features/student/marks/hooks/use-student-marks";
import { computeMarksSummary } from "@/features/student/marks/utils/marks-stats";
import { useAuth } from "@/hooks/use-auth";

export function StudentMarksPage() {
  const { user } = useAuth();
  const studentId = user?.id;
  const { entries, isLoading, error } = useStudentMarks(studentId);

  const summary = useMemo(() => computeMarksSummary(entries), [entries]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Marks Analysis"
          description="Subject performance, exam history, and trends."
        />
        <div className="flex min-h-[40vh] items-center justify-center">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading marks"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Marks Analysis"
          description="Subject performance, exam history, and trends."
        />
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Marks Analysis"
          description="Subject performance, exam history, and trends."
        />
        <MarksEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Marks Analysis"
        description="Subject performance, exam history, and trends."
      />

      {summary ? (
        <section aria-label="Marks summary">
          <MarksSummaryCards summary={summary} />
        </section>
      ) : null}

      <section aria-label="Marks table">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Subject-wise marks
        </h2>
        <MarksTable entries={entries} />
      </section>

      <section aria-label="Performance chart">
        <MarksTrendChart entries={entries} />
      </section>
    </div>
  );
}
