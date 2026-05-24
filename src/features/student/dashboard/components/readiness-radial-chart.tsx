"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadinessMeta } from "@/lib/utils/readiness";

type ReadinessRadialChartProps = {
  score: number | null;
};

export function ReadinessRadialChart({ score }: ReadinessRadialChartProps) {
  const meta = getReadinessMeta(score);
  const data = [{ name: "Readiness", value: score ?? 0, fill: meta.color }];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Exam readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        {score === null ? (
          <p className="py-8 text-sm text-muted-foreground">
            Add marks, attendance, and tasks to see readiness.
          </p>
        ) : (
          <>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  data={data}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} max={100} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-2xl font-semibold">{score}%</p>
            <p className="text-sm text-muted-foreground">{meta.label}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
