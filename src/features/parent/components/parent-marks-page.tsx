"use client";

import { ChildSelector } from "@/components/parent/child-selector";
import { PageHeader } from "@/components/shared/page-header";
import { MarksSummaryCards } from "@/features/student/marks/components/marks-summary-cards";
import { MarksTable } from "@/features/student/marks/components/marks-table";
import { MarksTrendChart } from "@/features/student/marks/components/marks-trend-chart";
import { computeMarksSummary } from "@/features/student/marks/utils/marks-stats";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { getSelectedStudentAuthId, useParentStore } from "@/store/parent-store";
import { useMemo } from "react";

export function ParentMarksPage() {
  const studentId = getSelectedStudentAuthId(useParentStore()) ?? undefined;
  const { entries, isLoading, error } = useStudentMarksSnapshot(studentId);
  const summary = useMemo(() => computeMarksSummary(entries), [entries]);

  return (
    <div className="space-y-6">
      <PageHeader title="Marks" description="Read-only marks analysis for your child." />
      <ChildSelector />
      {isLoading ? (
        <LoadingSpinner label="Loading marks" />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No marks recorded yet.</p>
      ) : (
        <>
          {summary ? <MarksSummaryCards summary={summary} /> : null}
          <MarksTrendChart entries={entries} />
          <MarksTable entries={entries} />
        </>
      )}
    </div>
  );
}
