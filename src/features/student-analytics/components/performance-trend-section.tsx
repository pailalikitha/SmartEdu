"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { getSubjectColor } from "@/features/student/marks/utils/marks-stats";
import { buildTrendChartData } from "@/features/teacher/utils/teacher-analytics";
import { formatDate } from "@/lib/utils/format";
import type { StudentMarkEntry } from "@/types/student-marks";

type PerformanceTrendSectionProps = {
  entries: StudentMarkEntry[];
};

export function PerformanceTrendSection({
  entries,
}: PerformanceTrendSectionProps) {
  const data = buildTrendChartData(entries);
  const subjects = [
    ...new Set(
      data.flatMap((row) =>
        Object.keys(row).filter((k) => k !== "date" && k !== "label"),
      ),
    ),
  ].sort();

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Not enough data for a trend chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSurface>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  formatDate(String(v), { month: "short", day: "numeric" })
                }
              />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip />
              <ReferenceLine y={60} stroke="var(--warning)" strokeDasharray="4 4" />
              <Legend />
              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={getSubjectColor(index)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartSurface>
      </CardContent>
    </Card>
  );
}
