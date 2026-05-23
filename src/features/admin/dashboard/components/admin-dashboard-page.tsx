"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAdminStatsSnapshot } from "@/hooks/use-admin-stats-snapshot";
import { formatPercentage, formatRelativeTime } from "@/lib/utils/format";

const PIE_COLORS = ["#16a34a", "#dc2626"];

export function AdminDashboardPage() {
  const { stats, isLoading, error } = useAdminStatsSnapshot();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading dashboard" />
      </div>
    );
  }

  const statCards = [
    { label: "Teachers", value: String(stats.teacherCount) },
    { label: "Students", value: String(stats.studentCount) },
    { label: "Classes", value: String(stats.classCount) },
    {
      label: "School average",
      value:
        stats.schoolAverage !== null
          ? formatPercentage(stats.schoolAverage)
          : "—",
    },
    {
      label: "Attendance",
      value:
        stats.attendancePercent !== null
          ? formatPercentage(stats.attendancePercent)
          : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="School-wide realtime academic overview."
      />

      {error ? (
        <div role="alert" className="text-sm text-destructive">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              <span className="text-[10px] font-medium text-success">● Live</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class-wise marks</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {stats.classMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No marks data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.classMarks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1a56a8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.attendanceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.attendanceDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentActivity.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-muted-foreground">{entry.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
