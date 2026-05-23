import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button, Card, CardContent } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  ADMIN_GRADE_BREAKDOWN,
  ADMIN_OVERVIEW_STATS,
  ADMIN_RECENT_ACTIVITY,
  ADMIN_SCHOOL_PERFORMANCE,
} from "@/features/admin/data/dashboard.mock";

type AdminDashboardProps = {
  displayName: string;
};

export function AdminDashboard({ displayName }: AdminDashboardProps) {
  return (
    <DashboardPage
      displayName={displayName}
      stats={ADMIN_OVERVIEW_STATS}
      performanceData={ADMIN_SCHOOL_PERFORMANCE}
      subjectData={ADMIN_GRADE_BREAKDOWN}
      performanceTitle="School performance"
      performanceDescription="Annual academic index trend"
      subjectTitle="Grade-wise average"
      subjectDescription="Current term by grade level"
      activities={ADMIN_RECENT_ACTIVITY}
      actions={
        <>
          <Link href={ROUTES.admin.interventions}>
            <Button variant="accent" size="sm">
              <Shield className="size-4" aria-hidden />
              Interventions
            </Button>
          </Link>
          <Link href={ROUTES.admin.classes}>
            <Button variant="outline" size="sm">
              Class comparison
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        </>
      }
      banner={
        <Card className="border-primary/15 bg-gradient-to-r from-secondary/60 via-card to-muted/30">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">School snapshot</p>
              <p className="mt-1 text-sm text-foreground">
                Overall index up <strong>1.4%</strong> year-over-year.{" "}
                <strong>47 students</strong> flagged for intervention.
              </p>
            </div>
            <Link href={ROUTES.admin.interventions}>
              <Button size="sm" className="w-full sm:w-auto">
                Review interventions
              </Button>
            </Link>
          </CardContent>
        </Card>
      }
    />
  );
}
