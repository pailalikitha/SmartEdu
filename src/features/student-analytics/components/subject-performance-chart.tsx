"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { formatPercentage } from "@/lib/utils/format";
import type { SubjectAverage } from "@/lib/utils/subject-stats";

function barFill(average: number): string {
  if (average >= 75) return "var(--success)";
  if (average >= 50) return "var(--warning)";
  return "var(--destructive)";
}

type SubjectPerformanceChartProps = {
  subjectAverages: SubjectAverage[];
};

export function SubjectPerformanceChart({
  subjectAverages,
}: SubjectPerformanceChartProps) {
  const data = subjectAverages.map((s) => ({
    subject: s.subject,
    average: s.average,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No marks data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSurface>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis
                type="category"
                dataKey="subject"
                width={90}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => [formatPercentage(Number(v)), "Average"]} />
              <ReferenceLine x={60} stroke="var(--warning)" strokeDasharray="4 4" label="Pass" />
              <ReferenceLine x={75} stroke="var(--success)" strokeDasharray="4 4" label="Good" />
              <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.subject} fill={barFill(entry.average)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSurface>
      </CardContent>
    </Card>
  );
}
