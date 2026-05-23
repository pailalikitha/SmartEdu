import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button, Card, CardContent } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  TEACHER_CLASS_PERFORMANCE,
  TEACHER_OVERVIEW_STATS,
  TEACHER_RECENT_ACTIVITY,
  TEACHER_SUBJECT_SCORES,
} from "@/features/teacher/data/dashboard.mock";

type TeacherDashboardProps = {
  displayName: string;
};

export function TeacherDashboard({ displayName }: TeacherDashboardProps) {
  return (
    <DashboardPage
      displayName={displayName}
      stats={TEACHER_OVERVIEW_STATS}
      performanceData={TEACHER_CLASS_PERFORMANCE}
      subjectData={TEACHER_SUBJECT_SCORES}
      performanceTitle="Class performance"
      performanceDescription="Average scores by section"
      subjectTitle="Assessment timeline"
      subjectDescription="Your subject cohort averages"
      activities={TEACHER_RECENT_ACTIVITY}
      actions={
        <>
          <Link href={ROUTES.teacher.assistant}>
            <Button variant="accent" size="sm">
              <Sparkles className="size-4" aria-hidden />
              AI Assistant
            </Button>
          </Link>
          <Link href={ROUTES.teacher.analytics}>
            <Button variant="outline" size="sm">
              Analytics
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        </>
      }
      banner={
        <Card className="border-warning/20 bg-gradient-to-r from-accent/50 via-card to-secondary/40">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-warning">Attention needed</p>
              <p className="mt-1 text-sm text-foreground">
                <strong>5 students</strong> in your classes are below the at-risk
                threshold this term.
              </p>
            </div>
            <Link href={ROUTES.teacher.classes}>
              <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                View classes
              </Button>
            </Link>
          </CardContent>
        </Card>
      }
    />
  );
}
