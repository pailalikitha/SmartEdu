"use client";

import { BarChart3, LineChart } from "lucide-react";

import { BarChart, type BarChartItem } from "@/components/dashboard/bar-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AttendanceChartsProps = {
  dailyChartData: BarChartItem[];
  statusChartData: BarChartItem[];
  monthLabel: string;
};

export function AttendanceCharts({
  dailyChartData,
  statusChartData,
  monthLabel,
}: AttendanceChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
              <LineChart className="size-4 text-secondary-foreground" aria-hidden />
            </div>
            <div>
              <CardTitle>Daily attendance rate</CardTitle>
              <CardDescription>{monthLabel} — % present per day</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {dailyChartData.length > 0 ? (
            <BarChart data={dailyChartData} maxValue={100} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No attendance data for this period.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
              <BarChart3 className="size-4 text-accent-foreground" aria-hidden />
            </div>
            <div>
              <CardTitle>Status breakdown</CardTitle>
              <CardDescription>Total marks by status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {statusChartData.some((d) => d.value > 0) ? (
            <BarChart
              data={statusChartData}
              valueSuffix=""
              maxValue={Math.max(...statusChartData.map((d) => d.value), 1)}
            />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No records match the current filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
