"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils/format";

type AttendanceDonutMiniProps = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number | null;
};

export function AttendanceDonutMini({
  presentCount,
  absentCount,
  lateCount,
  excusedCount,
  attendanceRate,
}: AttendanceDonutMiniProps) {
  const data = [
    { name: "Present", value: presentCount, color: "#16a34a" },
    { name: "Absent", value: absentCount, color: "#dc2626" },
    { name: "Late", value: lateCount, color: "#d97706" },
    { name: "Excused", value: excusedCount, color: "#6b7280" },
  ].filter((d) => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Attendance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {data.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">No attendance records yet.</p>
        ) : (
          <>
            <div className="h-40 w-full max-w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {attendanceRate !== null ? formatPercentage(attendanceRate) : "—"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
