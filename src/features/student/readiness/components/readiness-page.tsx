"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { Check, Info, X } from "lucide-react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/components/ui/toast";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { parseJsonStringArray } from "@/lib/ai/parse-json-array";
import { calculateAttendancePercent } from "@/services/attendance.service";
import {
  computeSubjectAverages,
  examReadinessLabel,
  overallAverageFromSubjects,
  partitionSubjectsByThreshold,
  subjectReadinessLabel,
} from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { useStudentAttendanceSnapshot } from "@/hooks/use-student-attendance-snapshot";
import { useStudentStudyTasksSnapshot } from "@/hooks/use-student-study-tasks-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function scoreFromTasks(tasks: { status: string }[]): number | null {
  if (tasks.length === 0) return null;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 1000) / 10;
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <X className="size-4 shrink-0 text-destructive" aria-hidden />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}

export function ReadinessPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const studentId = user?.id;

  const marks = useStudentMarksSnapshot(studentId);
  const attendance = useStudentAttendanceSnapshot(studentId);
  const tasks = useStudentStudyTasksSnapshot(studentId);

  const isLoading =
    marks.isLoading || attendance.isLoading || tasks.isLoading;
  const error = marks.error ?? attendance.error ?? tasks.error;

  useEffect(() => {
    if (error) toast({ title: error, variant: "error" });
  }, [error, toast]);

  const subjects = useMemo(
    () => computeSubjectAverages(marks.entries),
    [marks.entries],
  );
  const marksScore = overallAverageFromSubjects(subjects);
  const attendanceScore = useMemo(
    () => calculateAttendancePercent(attendance.records),
    [attendance.records],
  );
  const tasksScore = useMemo(
    () => scoreFromTasks(tasks.tasks),
    [tasks.tasks],
  );

  const readinessScore = useMemo(() => {
    const parts: { value: number; weight: number }[] = [];
    if (marksScore !== null) parts.push({ value: marksScore, weight: 0.4 });
    if (attendanceScore !== null)
      parts.push({ value: attendanceScore, weight: 0.3 });
    if (tasksScore !== null) parts.push({ value: tasksScore, weight: 0.3 });
    if (parts.length === 0) return null;

    const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
    const weighted = parts.reduce((s, p) => s + p.value * p.weight, 0);
    return Math.round((weighted / totalWeight) * 10) / 10;
  }, [marksScore, attendanceScore, tasksScore]);

  const readinessMeta =
    readinessScore !== null
      ? examReadinessLabel(readinessScore)
      : null;

  const { weak } = useMemo(
    () => partitionSubjectsByThreshold(subjects),
    [subjects],
  );

  const hasAnyData =
    marks.entries.length > 0 ||
    attendance.records.length > 0 ||
    tasks.tasks.length > 0;

  const completedTasks = tasks.tasks.filter(
    (t) => t.status === "completed",
  ).length;
  const allSubjectsAbove60 =
    subjects.length > 0 && subjects.every((s) => s.average >= 60);
  const noSubjectBelow40 =
    subjects.length === 0 || subjects.every((s) => s.average >= 40);

  const [advice, setAdvice] = useState<string[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const loadAdvice = async () => {
    if (readinessScore === null) return;
    setLoadingAdvice(true);
    try {
      const weakList = weak.map((s) => `${s.subject} (${s.average}%)`).join(", ");
      const text = await callAnthropic({
        messages: [
          {
            role: "user",
            content: `Student has exam readiness score of ${readinessScore}%. Marks average: ${marksScore ?? "N/A"}%, Attendance: ${attendanceScore ?? "N/A"}%, Study tasks done: ${tasksScore ?? "N/A"}%. Weak subjects: ${weakList || "none"}. Give 4 specific recommendations to improve readiness in next 7 days. Return as JSON array of 4 strings.`,
          },
        ],
      });
      setAdvice(parseJsonStringArray(text).slice(0, 4));
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Could not load advice.",
        variant: "error",
      });
    } finally {
      setLoadingAdvice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Competitive Readiness"
          description="Exam readiness from marks, attendance, and study tasks."
        />
        <LoadingSpinner label="Loading readiness" />
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Competitive Readiness"
          description="Exam readiness from marks, attendance, and study tasks."
        />
        <EmptyStateCard
          icon={Info}
          title="Not enough data yet"
          description="Complete attendance and ask your teacher to upload marks to see your exam readiness score."
        />
      </div>
    );
  }

  const chartData = [
    {
      name: "Readiness",
      value: readinessScore ?? 0,
      fill: readinessMeta?.color ?? "#1A56A8",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Competitive Readiness"
        description="Exam readiness from marks, attendance, and study tasks."
      />

      {readinessScore !== null && readinessMeta ? (
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center py-8">
            <div className="relative size-48 sm:size-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={14}
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: "var(--color-muted)" }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold sm:text-4xl">
                  {formatPercentage(readinessScore, 0)}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: readinessMeta.color }}
                >
                  {readinessMeta.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Marks Performance", score: marksScore, weight: "40%" },
          { label: "Attendance Rate", score: attendanceScore, weight: "30%" },
          { label: "Study Completion", score: tasksScore, weight: "30%" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-2 pt-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold">
                {item.score !== null ? formatPercentage(item.score) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Weightage: {item.weight}
              </p>
              {item.score !== null ? (
                <ProgressBar value={item.score} barClassName="bg-primary" />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">
            Subject Readiness
          </h2>
          <Card>
            <CardContent className="space-y-4 pt-1">
              {subjects.map((s) => (
                <div key={s.subject} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-muted-foreground">
                      {formatPercentage(s.average)} ·{" "}
                      {subjectReadinessLabel(s.average)}
                    </span>
                  </div>
                  <ProgressBar
                    value={s.average}
                    barClassName={cn(
                      s.average >= 71
                        ? "bg-success"
                        : s.average >= 41
                          ? "bg-warning"
                          : "bg-destructive",
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">
          Readiness Checklist
        </h2>
        <Card>
          <CardContent className="pt-1">
            <ul className="space-y-2">
              <ChecklistItem
                ok={attendanceScore !== null && attendanceScore >= 75}
                label="Attendance above 75%"
              />
              <ChecklistItem
                ok={allSubjectsAbove60}
                label="All subjects above 60%"
              />
              <ChecklistItem
                ok={completedTasks >= 5}
                label="At least 5 study tasks completed"
              />
              <ChecklistItem
                ok={noSubjectBelow40}
                label="No subjects below 40%"
              />
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Button
          onClick={() => void loadAdvice()}
          isLoading={loadingAdvice}
          disabled={readinessScore === null}
        >
          Get Personalized Advice
        </Button>
        {advice.length > 0 ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-2 pt-1">
              <p className="font-medium text-primary">Your 7-day plan</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
                {advice.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
