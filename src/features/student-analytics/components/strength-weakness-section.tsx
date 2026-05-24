"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StudyTipsButton } from "@/features/student-analytics/components/study-tips-button";
import { formatPercentage } from "@/lib/utils/format";
import type { SubjectAverage } from "@/lib/utils/subject-stats";

type StrengthWeaknessSectionProps = {
  strongSubjects: SubjectAverage[];
  weakSubjects: SubjectAverage[];
};

function SubjectList({
  title,
  subjects,
  showTips,
}: {
  title: string;
  subjects: SubjectAverage[];
  showTips?: boolean;
}) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No {title.toLowerCase()} recorded.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {[...subjects]
        .sort((a, b) => b.average - a.average)
        .map((s) => (
          <li key={s.subject}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{s.subject}</span>
              <span>{formatPercentage(s.average)}</span>
            </div>
            <ProgressBar value={s.average} className="mt-1" />
            {showTips ? (
              <StudyTipsButton subject={s.subject} average={s.average} />
            ) : null}
          </li>
        ))}
    </ul>
  );
}

export function StrengthWeaknessSection({
  strongSubjects,
  weakSubjects,
}: StrengthWeaknessSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strength vs weakness analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-success">
            Strong subjects (≥70%)
          </h3>
          <SubjectList title="Strong subjects" subjects={strongSubjects} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-destructive">
            Weak subjects (&lt;70%)
          </h3>
          <SubjectList
            title="Weak subjects"
            subjects={weakSubjects}
            showTips
          />
        </div>
      </CardContent>
    </Card>
  );
}
