"use client";

import { CalendarRange, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, Label, Text } from "@/components/ui";
import { AttendanceCharts } from "@/features/attendance/components/attendance-charts";
import { AttendanceFiltersBar } from "@/features/attendance/components/attendance-filters";
import {
  buildDailyRateChartData,
  buildDailyStats,
  buildStatusChartData,
  buildStudentMonthlyStats,
  filterRecords,
  summarizeMonth,
  type AttendanceFilters,
} from "@/features/attendance/utils/attendance-stats";
import { Button } from "@/components/ui/button";
import {
  getCurrentMonthValue,
  getMonthRange,
  parseMonthValue,
} from "@/lib/utils/date";
import { formatPercentage } from "@/lib/utils/format";
import { toAttendanceQueryFilters, toStudentListFilters } from "@/features/attendance/utils/query-filters";
import { buildYearMonth } from "@/lib/firebase/firestore/helpers";
import { getAttendanceForMonth } from "@/services/attendance.service";
import { listStudents } from "@/services/student.service";
import { TrendingUp, UserX, Calendar } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MonthlyReportPanel() {
  const [monthValue, setMonthValue] = useState(getCurrentMonthValue);
  const [filters, setFilters] = useState<AttendanceFilters>({
    grade: "all",
    section: "all",
    status: "all",
  });
  const [records, setRecords] = useState<Awaited<ReturnType<typeof getAttendanceForMonth>>>([]);
  const [students, setStudents] = useState<Awaited<ReturnType<typeof listStudents>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { year, month } = parseMonthValue(monthValue);
  const { startDate, label: monthLabel } = getMonthRange(year, month);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearMonth = buildYearMonth(startDate);
      const queryFilters = toAttendanceQueryFilters(filters);
      const [attendance, studentList] = await Promise.all([
        getAttendanceForMonth(yearMonth, queryFilters),
        listStudents(toStudentListFilters(filters)),
      ]);
      setRecords(attendance);
      setStudents(studentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, filters]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const filteredRecords = useMemo(
    () => filterRecords(records, filters),
    [records, filters],
  );

  const summary = useMemo(
    () => summarizeMonth(filteredRecords),
    [filteredRecords],
  );

  const dailyStats = useMemo(
    () => buildDailyStats(filteredRecords, year, month),
    [filteredRecords, year, month],
  );

  const studentStats = useMemo(
    () => buildStudentMonthlyStats(filteredRecords, students),
    [filteredRecords, students],
  );

  const dailyChartData = useMemo(
    () => buildDailyRateChartData(dailyStats),
    [dailyStats],
  );

  const statusChartData = useMemo(
    () => buildStatusChartData(filteredRecords),
    [filteredRecords],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="report-month">Month</Label>
              <div className="relative">
                <CalendarRange
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="report-month"
                  type="month"
                  value={monthValue}
                  onChange={(e) => setMonthValue(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <AttendanceFiltersBar
                filters={filters}
                onChange={setFilters}
                showStatus
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadReport()}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("size-4", isLoading && "animate-spin")}
                aria-hidden
              />
              Refresh report
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading report"
          />
        </div>
      ) : (
        <>
          <section aria-label="Monthly summary">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Average attendance"
                value={summary.averageRateLabel}
                change={`${monthLabel}`}
                trend="up"
                icon={TrendingUp}
                accent="blue"
              />
              <StatCard
                title="Total records"
                value={String(summary.totalRecords)}
                change="Marks in period"
                trend="neutral"
                icon={Calendar}
                accent="blue"
              />
              <StatCard
                title="Present / excused"
                value={String(summary.presentCount)}
                change="Counted as attended"
                trend="up"
                icon={Users}
                accent="yellow"
              />
              <StatCard
                title="Absent"
                value={String(summary.absentCount)}
                change="Requires follow-up"
                trend="down"
                icon={UserX}
                accent="yellow"
              />
            </div>
          </section>

          <AttendanceCharts
            dailyChartData={dailyChartData}
            statusChartData={statusChartData}
            monthLabel={monthLabel}
          />

          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-4 py-4">
                <h3 className="font-heading text-base font-semibold">
                  Student monthly summary
                </h3>
                <Text variant="muted" className="mt-1 text-sm">
                  Per-student attendance for {monthLabel}
                </Text>
              </div>

              {studentStats.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No attendance records"
                    description="Mark attendance or adjust filters to see student summaries."
                  />
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Student
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Class
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                            Present
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                            Absent
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                            Late
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                            Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {studentStats.map((row) => (
                          <tr
                            key={row.studentId}
                            className="hover:bg-muted/30"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium">{row.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                Roll {row.rollNumber}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              G{row.grade}-{row.section}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.present}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.absent}
                            </td>
                            <td className="px-4 py-3 text-center">{row.late}</td>
                            <td className="px-4 py-3 text-right">
                              <Badge
                                variant={
                                  row.rate >= 75
                                    ? "success"
                                    : row.rate >= 50
                                      ? "warning"
                                      : "destructive"
                                }
                              >
                                {formatPercentage(row.rate)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 p-4 md:hidden">
                    {studentStats.map((row) => (
                      <article
                        key={row.studentId}
                        className="rounded-lg border border-border p-3"
                      >
                        <p className="font-medium">{row.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          G{row.grade}-{row.section} · Roll {row.rollNumber}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span>P: {row.present}</span>
                          <span>A: {row.absent}</span>
                          <span>L: {row.late}</span>
                          <Badge
                            variant={
                              row.rate >= 75 ? "success" : "warning"
                            }
                          >
                            {formatPercentage(row.rate)}
                          </Badge>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
