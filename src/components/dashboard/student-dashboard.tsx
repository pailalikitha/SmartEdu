"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import type { Activity, ActivityType } from "@/components/dashboard/recent-activity";
import type { DashboardStatSlot } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { UpcomingAssignmentsWidget } from "@/features/assignments/components/upcoming-assignments-widget";
import { useStudentDashboard } from "@/features/student/hooks/use-student-dashboard";
import { useStudentProfileSnapshot } from "@/hooks/use-student-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { formatPercentage, formatRelativeTime } from "@/lib/utils/format";

type StudentDashboardProps = {
  displayName: string;
};

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

export function StudentDashboard({ displayName }: StudentDashboardProps) {
  const { user } = useAuth();
  const studentId = user?.id;
  const { student: profile } = useStudentProfileSnapshot(studentId);
  const { data, isLoading, error } = useStudentDashboard(studentId);

  const stats = useMemo((): DashboardStatSlot[] => {
    const { overallPerformance, attendancePercent, weakTopicsCount } = data;

    return [
      {
        id: "overall",
        title: "Overall Performance",
        value:
          overallPerformance !== null
            ? formatPercentage(overallPerformance)
            : "",
        change:
          overallPerformance !== null
            ? "Average across all mark entries"
            : "",
        trend: "neutral",
        icon: TrendingUp,
        accent: "blue",
        isEmpty: overallPerformance === null,
      },
      {
        id: "attendance",
        title: "Attendance",
        value:
          attendancePercent !== null
            ? formatPercentage(attendancePercent)
            : "",
        change:
          attendancePercent !== null
            ? "Present days vs total records"
            : "",
        trend: "neutral",
        icon: Calendar,
        accent: "blue",
        isEmpty: attendancePercent === null,
      },
      {
        id: "weak",
        title: "Weak Topics",
        value: weakTopicsCount !== null ? String(weakTopicsCount) : "",
        change:
          weakTopicsCount !== null
            ? weakTopicsCount === 0
              ? "No topics below 60%"
              : "Topics scoring below 60%"
            : "",
        trend: weakTopicsCount && weakTopicsCount > 0 ? "down" : "neutral",
        icon: BookOpen,
        accent: "yellow",
        isEmpty: weakTopicsCount === null,
      },
    ];
  }, [data]);

  const activities = useMemo((): Activity[] => {
    return data.activities.map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      time: formatRelativeTime(entry.timestamp),
      type: mapActivityType(entry.type),
    }));
  }, [data.activities]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <UpcomingAssignmentsWidget
        studentId={studentId}
        classId={profile?.classId}
      />

      <DashboardPage
        displayName={displayName}
        stats={stats}
        statsColumns={3}
        subjectData={data.subjectAverages}
        subjectEmpty={data.subjectAverages.length === 0}
        subjectTitle="Subject trend"
        subjectDescription="Average score per subject from your marks"
        activities={activities}
        actions={
          <>
            <Link href={ROUTES.student.studyPlanner}>
              <Button variant="accent" size="sm">
                <Sparkles className="size-4" aria-hidden />
                Study plan
              </Button>
            </Link>
            <Link href={ROUTES.student.marks}>
              <Button variant="outline" size="sm">
                View marks
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
