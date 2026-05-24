"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BookOpen, Calendar, ClipboardList, TrendingUp } from "lucide-react";

import type { Activity, ActivityType } from "@/components/dashboard/recent-activity";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button, Card, CardContent } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { StrengthWeaknessSection } from "@/features/student-analytics/components/strength-weakness-section";
import { SubjectPerformanceChart } from "@/features/student-analytics/components/subject-performance-chart";
import { PerformanceTrendSection } from "@/features/student-analytics/components/performance-trend-section";
import { AttendanceDonutMini } from "@/features/student/dashboard/components/attendance-donut-mini";
import { ReadinessRadialChart } from "@/features/student/dashboard/components/readiness-radial-chart";
import { RecentMarksList } from "@/features/student/dashboard/components/recent-marks-list";
import { TodayStudyTasks } from "@/features/student/dashboard/components/today-study-tasks";
import { useStudentDashboard } from "@/features/student/hooks/use-student-dashboard";
import { useStudentAssignmentsSnapshot } from "@/hooks/use-student-assignments-snapshot";
import { useStudentAnalytics } from "@/hooks/use-student-analytics";
import { useStudentProfileSnapshot } from "@/hooks/use-student-profile-snapshot";
import { useStudentStudyTasksSnapshot } from "@/hooks/use-student-study-tasks-snapshot";
import { useAuth } from "@/hooks/use-auth";
import {
  formatDashboardDate,
  getTimeGreeting,
} from "@/lib/utils/greeting";
import {
  computeReadinessScore,
  scoreFromTasks,
} from "@/lib/utils/readiness";
import { formatPercentage, formatRelativeTime } from "@/lib/utils/format";

function mapActivityType(type?: string): ActivityType {
  if (
    type === "exam" ||
    type === "alert" ||
    type === "plan" ||
    type === "achievement"
  ) {
    return type;
  }
  return "exam";
}

export function StudentHomeDashboard() {
  const { user } = useAuth();
  const studentId = user?.id;
  const displayName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Student";

  const { student: profile } = useStudentProfileSnapshot(studentId);
  const analytics = useStudentAnalytics(studentId);
  const { data: dashboardData, isLoading: activityLoading, error } =
    useStudentDashboard(studentId);
  const { tasks } = useStudentStudyTasksSnapshot(studentId);
  const assignments = useStudentAssignmentsSnapshot(studentId, profile?.classId);

  const readinessScore = useMemo(
    () =>
      computeReadinessScore(
        analytics.overallAverage,
        analytics.attendanceRate,
        scoreFromTasks(tasks),
      ),
    [analytics.overallAverage, analytics.attendanceRate, tasks],
  );

  const activities = useMemo((): Activity[] => {
    return dashboardData.activities.map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      time: formatRelativeTime(entry.timestamp),
      type: mapActivityType(entry.type),
    }));
  }, [dashboardData.activities]);

  const pendingAssignments = assignments.pending.length;
  const upcomingThree = assignments.upcoming.slice(0, 3);

  const initials =
    user?.displayName?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "?";

  if (analytics.loading || activityLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading your dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatDashboardDate()}
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {getTimeGreeting()}, {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href={ROUTES.student.profile}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-semibold text-primary"
            aria-label="Your profile"
          >
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="size-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </Link>
        </div>
      </header>

      {error || analytics.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error ?? analytics.error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Overall average",
            value:
              analytics.overallAverage !== null
                ? formatPercentage(analytics.overallAverage)
                : "—",
            icon: TrendingUp,
          },
          {
            label: "Attendance",
            value:
              analytics.attendanceRate !== null
                ? formatPercentage(analytics.attendanceRate)
                : "—",
            icon: Calendar,
          },
          {
            label: "Weak subjects",
            value: String(analytics.weakSubjectCount),
            icon: BookOpen,
          },
          {
            label: "Pending assignments",
            value: String(pendingAssignments),
            icon: ClipboardList,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start gap-3 py-4">
              <stat.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StrengthWeaknessSection
        strongSubjects={analytics.strongSubjects}
        weakSubjects={analytics.weakSubjects}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SubjectPerformanceChart subjectAverages={analytics.subjectAverages} />
        <PerformanceTrendSection entries={analytics.marksEntries} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AttendanceDonutMini
          presentCount={analytics.presentCount}
          absentCount={analytics.absentCount}
          lateCount={analytics.lateCount}
          excusedCount={analytics.excusedCount}
          attendanceRate={analytics.attendanceRate}
        />
        <ReadinessRadialChart score={readinessScore} />
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="space-y-3 py-4">
            <p className="text-base font-semibold">Upcoming assignments</p>
            {!profile?.classId ? (
              <p className="text-sm text-muted-foreground">
                Complete onboarding to see class assignments.
              </p>
            ) : upcomingThree.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending assignments.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingThree.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href={ROUTES.student.assignments}>
              <Button variant="outline" size="sm" className="w-full">
                View assignments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentMarksList entries={analytics.examHistory} />
        <TodayStudyTasks studentId={studentId} />
      </div>

      <RecentActivity activities={activities} maxItems={5} />
    </div>
  );
}
