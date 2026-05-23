import { BarChart3, LineChart } from "lucide-react";

import { BarChart, type BarChartItem } from "@/components/dashboard/bar-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsSectionProps = {
  performanceData: BarChartItem[];
  subjectData: BarChartItem[];
  performanceTitle?: string;
  performanceDescription?: string;
  subjectTitle?: string;
  subjectDescription?: string;
  className?: string;
};

export function AnalyticsSection({
  performanceData,
  subjectData,
  performanceTitle = "Performance trend",
  performanceDescription = "Last 6 months overall score",
  subjectTitle = "Subject breakdown",
  subjectDescription = "Current term averages",
  className,
}: AnalyticsSectionProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}>
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
          <BarChart data={performanceData} />
        </CardContent>
      </Card>

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
          <BarChart data={subjectData} maxValue={100} />
        </CardContent>
      </Card>
    </div>
  );
}
