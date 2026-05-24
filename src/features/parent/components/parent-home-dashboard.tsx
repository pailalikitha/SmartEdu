"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChildSelector } from "@/components/parent/child-selector";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StudyTipsButton } from "@/features/student-analytics/components/study-tips-button";
import { AttendanceBreakdownSection } from "@/features/student-analytics/components/attendance-breakdown-section";
import { PerformanceTrendSection } from "@/features/student-analytics/components/performance-trend-section";
import { SubjectPerformanceChart } from "@/features/student-analytics/components/subject-performance-chart";
import { ParentAlertSettingsInline } from "@/features/parent/components/parent-alert-settings-inline";
import { useParentContext } from "@/contexts/parent-context";
import { useStudentAnalytics } from "@/hooks/use-student-analytics";
import { useStudentAssignmentsSnapshot } from "@/hooks/use-student-assignments-snapshot";
import { useUserProfileSnapshot } from "@/hooks/use-user-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { formatPercentage } from "@/lib/utils/format";
import { getStudentFullName } from "@/types/student";

function sessionSummaryKey(studentId: string) {
  return `smartedu-parent-summary-${studentId}`;
}

export function ParentHomeDashboard() {
  const { user } = useAuth();
  const { profile } = useUserProfileSnapshot(user?.id);
  const { selectedChild, selectedStudentAuthId, children } = useParentContext();
  const summaryLoaded = useRef(false);

  const studentId = selectedStudentAuthId ?? undefined;
  const analytics = useStudentAnalytics(studentId);
  const assignments = useStudentAssignmentsSnapshot(
    studentId,
    selectedChild?.classId,
  );

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const parentName =
    profile?.name ?? profile?.displayName ?? user?.displayName ?? "Parent";
  const childName = selectedChild ? getStudentFullName(selectedChild) : "your child";

  const lastUpdated = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
  }, [analytics.marksEntries.length, analytics.attendanceRecords.length]);

  useEffect(() => {
    if (!studentId || analytics.loading || summaryLoaded.current) return;

    const cached =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(sessionSummaryKey(studentId))
        : null;
    if (cached) {
      setAiSummary(cached);
      summaryLoaded.current = true;
      return;
    }

    if (
      analytics.overallAverage === null &&
      analytics.attendanceRate === null
    ) {
      return;
    }

    summaryLoaded.current = true;
    setLoadingSummary(true);

    const strong = analytics.strongSubjects.map((s) => s.subject).join(", ");
    const weak = analytics.weakSubjects.map((s) => s.subject).join(", ");

    void callAnthropic({
      messages: [
        {
          role: "user",
          content: `Summarize this student's performance for their parent in 3 simple encouraging sentences using: overall average ${analytics.overallAverage ?? "N/A"}%, attendance ${analytics.attendanceRate ?? "N/A"}%, strong subjects ${strong || "none yet"}, weak subjects ${weak || "none"}.`,
        },
      ],
    })
      .then((text) => {
        const trimmed = text.trim();
        setAiSummary(trimmed);
        sessionStorage.setItem(sessionSummaryKey(studentId), trimmed);
      })
      .catch(() => {
        summaryLoaded.current = false;
      })
      .finally(() => setLoadingSummary(false));
  }, [
    studentId,
    analytics.loading,
    analytics.overallAverage,
    analytics.attendanceRate,
    analytics.strongSubjects,
    analytics.weakSubjects,
  ]);

  if (!selectedChild) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">No child selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {children.length > 1
            ? "Pick a child from the selector to view their dashboard."
            : "No student records are linked to your account yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello ${parentName.split(" ")[0]}!`}
        description={`Here's ${childName}'s performance overview.`}
      />
      <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>

      {children.length > 1 ? <ChildSelector /> : null}

      {analytics.loading ? (
        <LoadingSpinner label="Loading dashboard" />
      ) : (
        <>
          {aiSummary || loadingSummary ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4 text-sm">
                {loadingSummary ? (
                  <p className="text-muted-foreground">Preparing summary…</p>
                ) : (
                  <p className="leading-relaxed">{aiSummary}</p>
                )}
              </CardContent>
            </Card>
          ) : null}

          <div className="dashboard-stats-grid">
            {[
              {
                label: "Overall performance",
                value:
                  analytics.overallAverage !== null
                    ? formatPercentage(analytics.overallAverage)
                    : "—",
              },
              {
                label: "Attendance",
                value:
                  analytics.attendanceRate !== null
                    ? formatPercentage(analytics.attendanceRate)
                    : "—",
              },
              {
                label: "Needs help",
                value: String(analytics.weakSubjectCount),
              },
              {
                label: "Pending assignments",
                value: String(assignments.pending.length),
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-success/30">
              <CardContent className="space-y-3 py-4">
                <h2 className="font-semibold text-success">Doing well</h2>
                {analytics.strongSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Encourage steady effort — strong subjects will show up as marks are added.
                  </p>
                ) : (
                  analytics.strongSubjects.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm">
                        <span>{s.subject}</span>
                        <span>{formatPercentage(s.average)}</span>
                      </div>
                      <ProgressBar value={s.average} className="mt-1" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardContent className="space-y-3 py-4">
                <h2 className="font-semibold text-destructive">May need support</h2>
                {analytics.weakSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Great news — no subjects are below 70% right now.
                  </p>
                ) : (
                  analytics.weakSubjects.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm">
                        <span>{s.subject}</span>
                        <span>{formatPercentage(s.average)}</span>
                      </div>
                      <ProgressBar value={s.average} className="mt-1" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        About {Math.max(0, 70 - s.average)}% below the 70% target.
                      </p>
                      <StudyTipsButton subject={s.subject} average={s.average} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SubjectPerformanceChart subjectAverages={analytics.subjectAverages} />
            <PerformanceTrendSection entries={analytics.marksEntries} />
          </div>

          <AttendanceBreakdownSection
            presentCount={analytics.presentCount}
            absentCount={analytics.absentCount}
            lateCount={analytics.lateCount}
            excusedCount={analytics.excusedCount}
            attendanceRate={analytics.attendanceRate}
            attendanceByDate={analytics.attendanceByDate}
          />

          <Card>
            <CardContent className="py-4">
              <h2 className="mb-3 font-semibold">Recent marks</h2>
              {analytics.examHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No marks yet.</p>
              ) : (
                <ul className="divide-y divide-border/60 text-sm">
                  {analytics.examHistory.slice(0, 5).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex justify-between gap-2 py-2"
                    >
                      <span>
                        {entry.subject} · {entry.examType}
                      </span>
                      <span>
                        {entry.percentage}% ({entry.grade})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <ParentAlertSettingsInline parentUid={user?.id} />
        </>
      )}
    </div>
  );
}
