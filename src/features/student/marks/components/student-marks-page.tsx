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
import { useStudentAnalytics } from "@/hooks/use-student-analytics";
import { generateStudentReportCardPDF } from "@/lib/utils/export";
import { toDateString } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function StudentMarksPage() {
  const { user } = useAuth();
  const studentId = user?.id;
  const analytics = useStudentAnalytics(studentId);
  const { marksEntries: entries, loading: isLoading, error } = analytics;

  const summary = useMemo(() => computeMarksSummary(entries), [entries]);

  const handleDownload = () => {
    if (!user) return;
    const filename = `ReportCard_${user.displayName || "Student"}_${toDateString(new Date())}.pdf`;
    generateStudentReportCardPDF(user.displayName || "Student", "", analytics, filename);
  };

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
        action={
          <Button onClick={handleDownload} variant="outline">
            <Download className="size-4 mr-2" />
            Download Report Card
          </Button>
        }
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
