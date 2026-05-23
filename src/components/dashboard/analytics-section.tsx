import { BarChart3, LineChart } from "lucide-react";

import { BarChart, type BarChartItem } from "@/components/dashboard/bar-chart";
import { DashboardEmptyPlaceholder } from "@/components/dashboard/dashboard-empty-placeholder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsSectionProps = {
  subjectData: BarChartItem[];
  subjectTitle?: string;
  subjectDescription?: string;
  subjectEmpty?: boolean;
  performanceData?: BarChartItem[];
  performanceTitle?: string;
  performanceDescription?: string;
  performanceEmpty?: boolean;
  performanceEmptyMessage?: string;
  hideSubjectChart?: boolean;
  className?: string;
};

export function AnalyticsSection({
  subjectData,
  subjectTitle = "Subject trend",
  subjectDescription = "Average score per subject",
  subjectEmpty = false,
  performanceData,
  performanceTitle = "Performance trend",
  performanceDescription = "Overall performance over time",
  performanceEmpty = false,
  performanceEmptyMessage,
  hideSubjectChart = false,
  className,
}: AnalyticsSectionProps) {
  const showPerformance = performanceData !== undefined;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        showPerformance && "md:grid-cols-2",
        className,
      )}
    >
      {showPerformance ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-secondary shadow-sm">
                <LineChart
                  className="size-4 text-secondary-foreground"
                  aria-hidden
                />
              </div>
              <div>
                <CardTitle>{performanceTitle}</CardTitle>
                <CardDescription>{performanceDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {performanceEmpty ? (
              <DashboardEmptyPlaceholder
                minHeight="min-h-[10rem]"
                message={performanceEmptyMessage}
              />
            ) : (
              <BarChart data={performanceData ?? []} maxValue={100} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {!hideSubjectChart ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent shadow-sm">
                <BarChart3
                  className="size-4 text-accent-foreground"
                  aria-hidden
                />
              </div>
              <div>
                <CardTitle>{subjectTitle}</CardTitle>
                <CardDescription>{subjectDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {subjectEmpty ? (
              <DashboardEmptyPlaceholder minHeight="min-h-[10rem]" />
            ) : (
              <BarChart data={subjectData} maxValue={100} />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
