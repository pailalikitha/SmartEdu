"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import type { DashboardStatSlot } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useTeacherDashboard } from "@/features/teacher/hooks/use-teacher-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { formatPercentage } from "@/lib/utils/format";

const EMPTY_MARKS_MESSAGE =
  "No data yet — upload student marks to see performance";
const CHART_EMPTY_MESSAGE = "Upload student data to see analytics";

type TeacherDashboardProps = {
  displayName: string;
};

export function TeacherDashboard({ displayName }: TeacherDashboardProps) {
  const { user } = useAuth();
  const teacherId = user?.id;
  const { data, isLoading, error } = useTeacherDashboard(teacherId);

  const stats = useMemo((): DashboardStatSlot[] => {
    const { totalClasses, studentCount, classAverage, hasMarks } = data;

    return [
      {
        id: "classes",
        title: "Total Classes",
        value: String(totalClasses),
        change:
          totalClasses === 1
            ? "1 class assigned"
            : `${totalClasses} classes assigned`,
        trend: "neutral",
        icon: BookOpen,
        accent: "blue",
        isEmpty: false,
      },
      {
        id: "avg",
        title: "Class Average",
        value:
          classAverage !== null ? formatPercentage(classAverage) : "",
        change:
          classAverage !== null
            ? "Across all students in your classes"
            : "",
        trend: "neutral",
        icon: BarChart3,
        accent: "blue",
        isEmpty: !hasMarks,
      },
      {
        id: "students",
        title: "Students",
        value: String(studentCount),
        change:
          studentCount === 1
            ? "1 student enrolled"
            : `${studentCount} students enrolled`,
        trend: "neutral",
        icon: Users,
        accent: "yellow",
        isEmpty: false,
      },
    ];
  }, [data]);

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

      <DashboardPage
        displayName={displayName}
        stats={stats}
        statsColumns={3}
        subjectData={[]}
        hideSubjectChart
        performanceData={data.classPerformance}
        performanceTitle="Class performance"
        performanceDescription="Average marks by class"
        performanceEmpty={!data.hasMarks}
        performanceEmptyMessage={CHART_EMPTY_MESSAGE}
        emptyStatMessage={EMPTY_MARKS_MESSAGE}
        showRecentActivity={false}
        activities={[]}
        actions={
          <>
            <Link href={ROUTES.teacher.assistant}>
              <Button variant="accent" size="sm">
                <Sparkles className="size-4" aria-hidden />
                AI Assistant
              </Button>
            </Link>
            <Link href={ROUTES.teacher.classes}>
              <Button variant="outline" size="sm">
                View classes
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
