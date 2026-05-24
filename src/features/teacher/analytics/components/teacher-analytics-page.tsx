"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, BarChart3, Lightbulb, Sparkles } from "lucide-react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import {
  buildTrendChartData,
  computeTeacherAnalytics,
} from "@/features/teacher/utils/teacher-analytics";
import { useAuth } from "@/hooks/use-auth";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { parseJsonStringArray } from "@/lib/ai/parse-json-array";
import { formatPercentage } from "@/lib/utils/format";
import { getStudentFullName } from "@/types/student";
import { sendTeacherAlertNotification } from "@/services/notifications.service";
import { getSubjectColor } from "@/features/student/marks/utils/marks-stats";

function barColor(value: number): string {
  if (value > 75) return "#16a34a";
  if (value >= 50) return "#d97706";
  return "#dc2626";
}

export function TeacherAnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = user?.id;

  const { classes, isLoading: loadingClasses, error: classesError } =
    useTeacherClassesSnapshot(teacherId);
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const roster = useTeacherRosterSnapshot(classIds);

  const analytics = useMemo(
    () =>
      computeTeacherAnalytics(
        classes,
        roster.students,
        roster.marksByStudent,
        roster.attendanceByStudent,
      ),
    [classes, roster.students, roster.marksByStudent, roster.attendanceByStudent],
  );

  const trendData = useMemo(
    () => buildTrendChartData(analytics.allEntries),
    [analytics.allEntries],
  );

  const trendSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const row of trendData) {
      for (const key of Object.keys(row)) {
        if (key !== "date" && key !== "label") set.add(key);
      }
    }
    return Array.from(set).sort();
  }, [trendData]);

  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const isLoading = loadingClasses || roster.isLoading;
  const error = classesError ?? roster.error;

  useEffect(() => {
    if (error) toast({ title: error, variant: "error" });
  }, [error, toast]);

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const text = await callAnthropic({
        messages: [
          {
            role: "user",
            content: `Teacher's class analytics data: Total students: ${analytics.totalStudents}, Class average: ${analytics.classAverage ?? "N/A"}%, Attendance rate: ${analytics.attendanceRate ?? "N/A"}%, At-risk students: ${analytics.atRisk.length}, Subject averages: ${JSON.stringify(analytics.subjectAverages.map((s) => ({ subject: s.subject, average: s.average })))}. Give 5 specific, actionable recommendations for this teacher to improve student outcomes. Be direct and practical. Return as JSON array of 5 strings.`,
          },
        ],
      });
      setInsights(parseJsonStringArray(text).slice(0, 5));
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Could not generate insights.",
        variant: "error",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const notifyStudent = async (
    studentId: string,
    studentName: string,
    authUserId?: string,
  ) => {
    const targetId = authUserId ?? studentId;
    setNotifyingId(studentId);
    try {
      await sendTeacherAlertNotification(
        targetId,
        "Your teacher has flagged your performance. Please check your marks and attendance.",
      );
      toast({ title: `Notification sent to ${studentName}` });
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Failed to send notification.",
        variant: "error",
      });
    } finally {
      setNotifyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Class Analytics"
          description="Performance trends and at-risk students."
        />
        <LoadingSpinner label="Loading analytics" />
      </div>
    );
  }

  if (analytics.allEntries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Class Analytics"
          description="Performance trends and at-risk students."
        />
        <EmptyStateCard
          icon={BarChart3}
          title="Upload student marks to unlock analytics"
          description="Once marks are uploaded for your classes, charts and insights will appear here."
          actionLabel="Go to Upload Data"
          onAction={() => {
            window.location.href = ROUTES.teacher.uploadData;
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Class Analytics"
        description="Performance trends and at-risk students."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-[3px] border-l-primary">
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-semibold">{analytics.totalStudents}</p>
          </CardContent>
        </Card>
        <Card
          className={
            analytics.classAverage !== null && analytics.classAverage >= 60
              ? "border-l-[3px] border-l-success"
              : "border-l-[3px] border-l-destructive"
          }
        >
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">Class Average</p>
            <p className="text-2xl font-semibold">
              {analytics.classAverage !== null
                ? formatPercentage(analytics.classAverage)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            analytics.attendanceRate !== null && analytics.attendanceRate >= 75
              ? "border-l-[3px] border-l-success"
              : "border-l-[3px] border-l-destructive"
          }
        >
          <CardContent className="pt-1">
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="text-2xl font-semibold">
              {analytics.attendanceRate !== null
                ? formatPercentage(analytics.attendanceRate)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-[3px] border-l-destructive">
          <CardContent className="flex items-start justify-between pt-1">
            <div>
              <p className="text-sm text-muted-foreground">At-Risk Students</p>
              <p className="text-2xl font-semibold">{analytics.atRisk.length}</p>
            </div>
            <AlertTriangle className="size-5 text-destructive" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Class Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.subjectAverages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Upload marks to see subject analytics
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subjectAverages}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) =>
                      formatPercentage(Number(value ?? 0))
                    }
                  />
                  <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                    {analytics.subjectAverages.map((entry) => (
                      <Cell
                        key={entry.subject}
                        fill={barColor(entry.average)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add exam dates to marks to see trends.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) =>
                      formatPercentage(Number(value ?? 0))
                    }
                  />
                  <Legend />
                  {trendSubjects.map((subject, i) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      stroke={getSubjectColor(i)}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-lg font-semibold">
            Students Needing Attention
          </h2>
          <Badge variant="destructive">{analytics.atRisk.length}</Badge>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Marks Avg</th>
                <th className="px-4 py-3 font-medium">Attendance</th>
                <th className="px-4 py-3 font-medium">Risk Reason</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.atRisk.map((row) => (
                <tr key={row.student.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={ROUTES.teacher.studentDetail(row.student.id)}
                      className="text-primary hover:underline"
                    >
                      {getStudentFullName(row.student)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.className}</td>
                  <td className="px-4 py-3">
                    {row.marksAvg !== null
                      ? formatPercentage(row.marksAvg)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.attendancePct !== null
                      ? formatPercentage(row.attendancePct)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{row.riskReason}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={ROUTES.teacher.studentDetail(row.student.id)}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted"
                      >
                        View
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={notifyingId === row.student.id}
                        onClick={() =>
                          void notifyStudent(
                            row.student.id,
                            getStudentFullName(row.student),
                            row.student.authUserId,
                          )
                        }
                      >
                        Notify
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.atRisk.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No at-risk students right now.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => void generateInsights()}
            isLoading={loadingInsights}
          >
            <Sparkles className="size-4" />
            Generate AI Insights
          </Button>
          {insights.length > 0 ? (
            <Button variant="outline" onClick={() => void generateInsights()}>
              Regenerate
            </Button>
          ) : null}
        </div>
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {insights.map((text, i) => (
              <Card key={text}>
                <CardContent className="flex gap-3 pt-1">
                  <Lightbulb className="mt-0.5 size-5 shrink-0 text-warning" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Insight {i + 1}
                    </p>
                    <p className="text-sm">{text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <Link
        href={ROUTES.teacher.uploadData}
        className="text-sm font-medium text-primary hover:underline"
      >
        Upload more marks →
      </Link>
    </div>
  );
}
