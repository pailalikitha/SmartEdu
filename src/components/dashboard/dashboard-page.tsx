import type { ReactNode } from "react";

import { AnalyticsSection } from "@/components/dashboard/analytics-section";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { RecentActivity, type Activity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import type { BarChartItem } from "@/components/dashboard/bar-chart";
import type { StatCardData } from "@/types/dashboard";

export type DashboardPageProps = {
  displayName: string;
  banner?: ReactNode;
  actions?: ReactNode;
  stats: StatCardData[];
  performanceData: BarChartItem[];
  subjectData: BarChartItem[];
  performanceTitle?: string;
  performanceDescription?: string;
  subjectTitle?: string;
  subjectDescription?: string;
  activities: Activity[];
};

export function DashboardPage({
  displayName,
  banner,
  actions,
  stats,
  performanceData,
  subjectData,
  performanceTitle,
  performanceDescription,
  subjectTitle,
  subjectDescription,
  activities,
}: DashboardPageProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <DashboardGreeting name={displayName} />
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
            {actions}
          </div>
        ) : null}
      </div>

      {banner}

      <section aria-label="Overview">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground sm:mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="space-y-4 md:space-y-6 lg:col-span-2">
          <section aria-label="Analytics">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground sm:mb-4">
              Analytics
            </h2>
            <AnalyticsSection
              performanceData={performanceData}
              subjectData={subjectData}
              performanceTitle={performanceTitle}
              performanceDescription={performanceDescription}
              subjectTitle={subjectTitle}
              subjectDescription={subjectDescription}
            />
          </section>
        </div>

        <section
          aria-label="Recent activity"
          className="min-w-0 lg:sticky lg:top-24 lg:self-start"
        >
          <h2 className="mb-3 text-sm font-medium text-muted-foreground sm:mb-4 lg:sr-only">
            Recent activity
          </h2>
          <RecentActivity activities={activities} />
        </section>
      </div>
    </div>
  );
}
