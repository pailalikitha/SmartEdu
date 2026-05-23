import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button, Card, CardContent } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  OVERVIEW_STATS,
  PERFORMANCE_CHART,
  RECENT_ACTIVITY,
  SUBJECT_BREAKDOWN,
} from "@/features/student/data/dashboard.mock";

type StudentDashboardProps = {
  displayName: string;
};

export function StudentDashboard({ displayName }: StudentDashboardProps) {
  return (
    <DashboardPage
      displayName={displayName}
      stats={OVERVIEW_STATS}
      performanceData={PERFORMANCE_CHART}
      subjectData={SUBJECT_BREAKDOWN}
      activities={RECENT_ACTIVITY}
      actions={
        <>
          <Link href={ROUTES.student.studyPlanner}>
            <Button variant="accent" size="sm">
              <Sparkles className="size-4" aria-hidden />
              Study plan
            </Button>
          </Link>
          <Link href={ROUTES.student.marks}>
            <Button variant="outline" size="sm">
              View marks
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        </>
      }
      banner={
        <Card
          accent="yellow"
          className="border-primary/10 bg-gradient-to-r from-secondary/80 via-card to-accent/40"
        >
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">AI insight</p>
              <p className="mt-1 text-sm text-foreground">
                Focus on <strong>Organic Chemistry Ch. 5</strong> this week —
                your highest-impact weak area.
              </p>
            </div>
            <Link href={ROUTES.student.weakTopics}>
              <Button size="sm" className="w-full sm:w-auto">
                Review topics
              </Button>
            </Link>
          </CardContent>
        </Card>
      }
    />
  );
}
