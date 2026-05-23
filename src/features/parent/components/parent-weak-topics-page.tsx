"use client";

import { useEffect, useMemo, useState } from "react";

import { ChildSelector } from "@/components/parent/child-selector";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { parseJsonStringArray } from "@/lib/ai/parse-json-array";
import { computeSubjectAverages } from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { getSelectedStudentAuthId, useParentStore } from "@/store/parent-store";

export function ParentWeakTopicsPage() {
  const { toast } = useToast();
  const studentId = getSelectedStudentAuthId(useParentStore()) ?? undefined;
  const { entries, isLoading, error } = useStudentMarksSnapshot(studentId);
  const weak = useMemo(
    () => computeSubjectAverages(entries).filter((s) => s.average < 60),
    [entries],
  );
  const [tips, setTips] = useState<Record<string, string[]>>({});
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);

  const loadTips = async (subject: string, average: number) => {
    if (tips[subject]) return;
    setLoadingSubject(subject);
    try {
      const text = await callAnthropic({
        messages: [
          {
            role: "user",
            content: `A child scored below 60% in ${subject} (average ${average}%). Give 3 parent-friendly study tips to support them at home. Return JSON array of 3 strings only.`,
          },
        ],
      });
      setTips((prev) => ({ ...prev, [subject]: parseJsonStringArray(text).slice(0, 3) }));
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Could not load tips",
      });
    } finally {
      setLoadingSubject(null);
    }
  };

  useEffect(() => {
    for (const s of weak) {
      void loadTips(s.subject, s.average);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weak.length]);

  return (
    <div className="space-y-6">
      <PageHeader title="Weak topics" description="Subjects where your child needs support." />
      <ChildSelector />
      {isLoading ? (
        <LoadingSpinner label="Loading" />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : weak.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No subjects below 60% — great progress!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {weak.map((s) => (
            <Card key={s.subject}>
              <CardContent className="space-y-2 py-4">
                <p className="font-medium">
                  Your child scored below 60% in {s.subject} ({formatPercentage(s.average)})
                </p>
                {loadingSubject === s.subject ? (
                  <p className="text-sm text-muted-foreground">Loading study tips…</p>
                ) : tips[s.subject] ? (
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {tips[s.subject].map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
