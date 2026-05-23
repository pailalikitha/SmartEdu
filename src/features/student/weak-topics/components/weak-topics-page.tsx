"use client";

import { ChevronDown, Info, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/components/ui/toast";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { parseJsonStringArray } from "@/lib/ai/parse-json-array";
import {
  computeSubjectAverages,
  overallAverageFromSubjects,
  partitionSubjectsByThreshold,
} from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function SummaryStatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "red" | "green" | "blue";
}) {
  const tones = {
    red: "border-l-destructive bg-destructive/5",
    green: "border-l-success bg-success/5",
    blue: "border-l-primary bg-primary/5",
  };

  return (
    <Card className={cn("border-l-[3px] shadow-sm", tones[tone])}>
      <CardContent className="space-y-1 pt-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function StudyTipsSection({
  subject,
  average,
}: {
  subject: string;
  average: number;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  const loadTips = async () => {
    if (tips.length > 0) {
      setOpen((v) => !v);
      return;
    }

    setOpen(true);
    setLoadingTips(true);

    try {
      const text = await callAnthropic({
        messages: [
          {
            role: "user",
            content: `A student is weak in ${subject} with ${average}% average. Give exactly 3 specific, actionable study tips in simple language. Return only a JSON array of 3 strings, nothing else.`,
          },
        ],
      });
      setTips(parseJsonStringArray(text).slice(0, 3));
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Could not load study tips.",
        variant: "error",
      });
      setOpen(false);
    } finally {
      setLoadingTips(false);
    }
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => void loadTips()}
        className="flex w-full items-center justify-between text-sm font-medium text-primary"
      >
        Study Tips
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="mt-3">
          {loadingTips ? (
            <div className="flex justify-center py-4">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function WeakTopicsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const studentId = user?.id;
  const { entries, isLoading, error } = useStudentMarksSnapshot(studentId);

  const subjects = useMemo(() => computeSubjectAverages(entries), [entries]);
  const { weak, strong } = useMemo(
    () => partitionSubjectsByThreshold(subjects),
    [subjects],
  );
  const overall = useMemo(
    () => overallAverageFromSubjects(subjects),
    [subjects],
  );

  useEffect(() => {
    if (error) toast({ title: error, variant: "error" });
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weak Topics"
          description="Subjects that need attention based on your marks."
        />
        <LoadingSpinner label="Loading weak topics" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weak Topics"
          description="Subjects that need attention based on your marks."
        />
        <EmptyStateCard
          icon={Info}
          title="No marks uploaded yet"
          description="Your weak topics will appear here once your teacher uploads marks."
        />
      </div>
    );
  }

  if (weak.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weak Topics"
          description="Subjects that need attention based on your marks."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryStatCard title="Total Weak Subjects" value="0" tone="red" />
          <SummaryStatCard
            title="Subjects On Track"
            value={String(strong.length)}
            tone="green"
          />
          <SummaryStatCard
            title="Overall Average"
            value={overall !== null ? formatPercentage(overall) : "—"}
            tone="blue"
          />
        </div>
        <EmptyStateCard
          icon={Trophy}
          title="Excellent! No weak areas detected."
          description="Keep maintaining your performance!"
        />
        {strong.length > 0 ? (
          <section>
            <h2 className="mb-3 font-heading text-lg font-semibold">Doing Well</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {strong.map((s) => (
                <Card key={s.subject} className="border-l-[3px] border-l-success">
                  <CardContent className="space-y-2 pt-1">
                    <p className="font-semibold">{s.subject}</p>
                    <p className="text-sm font-medium text-success">
                      {formatPercentage(s.average)}
                    </p>
                    <ProgressBar
                      value={s.average}
                      barClassName="bg-success"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Weak Topics"
        description="Subjects that need attention based on your marks."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStatCard
          title="Total Weak Subjects"
          value={String(weak.length)}
          tone="red"
        />
        <SummaryStatCard
          title="Subjects On Track"
          value={String(strong.length)}
          tone="green"
        />
        <SummaryStatCard
          title="Overall Average"
          value={overall !== null ? formatPercentage(overall) : "—"}
          tone="blue"
        />
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">
          Needs Attention
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {weak.map((s) => (
            <Card key={s.subject} className="border-l-[3px] border-l-destructive">
              <CardContent className="space-y-3 pt-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xl font-bold">{s.subject}</p>
                  <Badge variant="destructive">Needs Attention</Badge>
                </div>
                <p className="text-lg font-semibold text-destructive">
                  {formatPercentage(s.average)}
                </p>
                <ProgressBar
                  value={s.average}
                  barClassName="bg-destructive"
                />
                <StudyTipsSection subject={s.subject} average={s.average} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {strong.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">Doing Well</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {strong.map((s) => (
              <Card key={s.subject} className="border-l-[3px] border-l-success">
                <CardContent className="space-y-2 pt-1">
                  <p className="font-semibold">{s.subject}</p>
                  <p className="text-sm font-medium text-success">
                    {formatPercentage(s.average)}
                  </p>
                  <ProgressBar value={s.average} barClassName="bg-success" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
