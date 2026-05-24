"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import {
  buildChartData,
  getSubjectColor,
  getUniqueSubjects,
} from "@/features/student/marks/utils/marks-stats";
import { formatDate } from "@/lib/utils/format";
import type { StudentMarkEntry } from "@/types/student-marks";
import { cn } from "@/lib/utils";

type MarksTrendChartProps = {
  entries: StudentMarkEntry[];
};

export function MarksTrendChart({ entries }: MarksTrendChartProps) {
  const allSubjects = useMemo(() => getUniqueSubjects(entries), [entries]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visibleSubjects = useMemo(() => {
    const set = new Set(allSubjects);
    for (const s of hidden) set.delete(s);
    return set;
  }, [allSubjects, hidden]);

  const { data, subjects } = useMemo(
    () => buildChartData(entries, visibleSubjects),
    [entries, visibleSubjects],
  );

  const toggleSubject = (subject: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  if (allSubjects.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle>Performance trend</CardTitle>
        <CardDescription>
          Percentage over time — click legend items to show or hide subjects
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartSurface
          role="img"
          aria-label="Line chart of marks percentage by subject over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  formatDate(String(value), { month: "short", day: "numeric" })
                }
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [
                  `${value ?? 0}%`,
                  "Score",
                ]}
                labelFormatter={(label) =>
                  formatDate(String(label), {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }
              />
              <Legend
                onClick={(e) => {
                  const key = e.value;
                  if (typeof key === "string") toggleSubject(key);
                }}
                wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
              />
              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={getSubjectColor(index)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartSurface>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Subject toggles">
          {allSubjects.map((subject, index) => {
            const isHidden = hidden.has(subject);
            return (
              <button
                key={subject}
                type="button"
                aria-pressed={!isHidden}
                onClick={() => toggleSubject(subject)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isHidden
                    ? "border-border bg-muted/50 text-muted-foreground line-through"
                    : "border-border bg-card text-foreground shadow-sm",
                )}
              >
                <span
                  className="mr-1.5 inline-block size-2 rounded-full"
                  style={{ backgroundColor: getSubjectColor(index) }}
                  aria-hidden
                />
                {subject}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
