import type { ReactNode } from "react";

import { AnalyticsSection } from "@/components/dashboard/analytics-section";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { DashboardEmptyPlaceholder } from "@/components/dashboard/dashboard-empty-placeholder";
import { RecentActivity, type Activity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import type { BarChartItem } from "@/components/dashboard/bar-chart";
import type { StatCardData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export type DashboardStatSlot = StatCardData & {
  isEmpty?: boolean;
};

export type DashboardPageProps = {
  displayName: string;
  banner?: ReactNode;
  actions?: ReactNode;
  stats: DashboardStatSlot[];
  subjectData: BarChartItem[];
  subjectEmpty?: boolean;
  subjectTitle?: string;
  subjectDescription?: string;
  performanceData?: BarChartItem[];
  performanceTitle?: string;
  performanceDescription?: string;
  performanceEmpty?: boolean;
  performanceEmptyMessage?: string;
  emptyStatMessage?: string;
  hideSubjectChart?: boolean;
  showRecentActivity?: boolean;
  statsColumns?: 3 | 4;
  activities: Activity[];
};

export function DashboardPage({
  displayName,
  banner,
  actions,
  stats,
  subjectData,
  subjectEmpty,
  subjectTitle,
  subjectDescription,
  performanceData,
  performanceTitle,
  performanceDescription,
  performanceEmpty,
  performanceEmptyMessage,
  emptyStatMessage,
  hideSubjectChart,
  showRecentActivity = true,
  statsColumns = 4,
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
        <div
          className={cn(
            "dashboard-stats-grid",
            statsColumns === 3 && "lg:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]",
          )}
        >
          {stats.map(({ isEmpty, ...stat }) =>
            isEmpty ? (
              <DashboardEmptyPlaceholder
                key={stat.id}
                message={emptyStatMessage}
              />
            ) : (
              <StatCard key={stat.id} {...stat} showLive />
            ),
          )}
        </div>
      </section>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div
          className={cn(
            "space-y-4 md:space-y-6",
            showRecentActivity ? "lg:col-span-2" : "lg:col-span-3",
          )}
        >
          <section aria-label="Analytics">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground sm:mb-4">
              Analytics
            </h2>
            <AnalyticsSection
              subjectData={subjectData}
              subjectEmpty={subjectEmpty}
              subjectTitle={subjectTitle}
              subjectDescription={subjectDescription}
              performanceData={performanceData}
              performanceTitle={performanceTitle}
              performanceDescription={performanceDescription}
              performanceEmpty={performanceEmpty}
              performanceEmptyMessage={performanceEmptyMessage}
              hideSubjectChart={hideSubjectChart}
            />
          </section>
        </div>

        {showRecentActivity ? (
          <section
            aria-label="Recent activity"
            className="min-w-0 lg:sticky lg:top-24 lg:self-start"
          >
            <h2 className="mb-3 text-sm font-medium text-muted-foreground sm:mb-4 lg:sr-only">
              Recent activity
            </h2>
            <RecentActivity activities={activities} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
