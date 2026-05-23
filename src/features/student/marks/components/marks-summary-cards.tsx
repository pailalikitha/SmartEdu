import {
  Award,
  BarChart3,
  BookOpen,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatPercentage } from "@/lib/utils/format";
import type { MarksSummary } from "@/types/student-marks";

type MarksSummaryCardsProps = {
  summary: MarksSummary;
};

export function MarksSummaryCards({ summary }: MarksSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Overall Average"
        value={formatPercentage(summary.overallAverage)}
        change="Across all uploaded exams"
        trend="neutral"
        icon={TrendingUp}
        accent="blue"
      />
      <StatCard
        title="Best Subject"
        value={summary.bestSubject?.name ?? "—"}
        change={
          summary.bestSubject
            ? formatPercentage(summary.bestSubject.average)
            : "No data"
        }
        trend="up"
        icon={Award}
        accent="blue"
      />
      <StatCard
        title="Weakest Subject"
        value={summary.weakestSubject?.name ?? "—"}
        change={
          summary.weakestSubject
            ? formatPercentage(summary.weakestSubject.average)
            : "No data"
        }
        trend="down"
        icon={BookOpen}
        accent="yellow"
      />
      <StatCard
        title="Total Exams"
        value={String(summary.totalExams)}
        change="Records in your mark sheet"
        trend="neutral"
        icon={BarChart3}
        accent="yellow"
      />
    </div>
  );
}
