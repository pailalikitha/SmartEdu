"use client";

import { ClipboardList, History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTabs } from "@/components/layout/responsive-tabs";
import { AttendanceHistoryPanel } from "@/features/teacher/attendance/components/attendance-history-panel";
import { AttendanceMarkingPanel } from "@/features/teacher/attendance/components/attendance-marking-panel";
import { ClassSelectorPanel } from "@/features/teacher/attendance/components/class-selector-panel";
import { useAuth } from "@/hooks/use-auth";
import { listClassesByTeacher } from "@/services/classes.service";
import type { ClassRoom } from "@/types/class";
import { toDateString } from "@/lib/utils/date";

const TABS = [
  {
    id: "mark" as const,
    label: "Mark attendance",
    shortLabel: "Mark",
    icon: ClipboardList,
  },
  {
    id: "history" as const,
    label: "View history",
    shortLabel: "History",
    icon: History,
  },
];

export function TeacherAttendancePage() {
  const { user } = useAuth();
  const teacherId = user?.id ?? "";

  const [tab, setTab] = useState<"mark" | "history">("mark");
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [loadToken, setLoadToken] = useState(0);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  const loadClasses = useCallback(async () => {
    if (!teacherId) {
      setClasses([]);
      setIsLoadingClasses(false);
      return;
    }

    setIsLoadingClasses(true);
    try {
      const data = await listClassesByTeacher(teacherId);
      setClasses(data);
    } catch {
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const handleLoadStudents = () => {
    if (!selectedClassId) return;
    setStudentsLoaded(true);
    setLoadToken((t) => t + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Select a class, mark daily attendance, and review history."
      />

      <ResponsiveTabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        ariaLabel="Teacher attendance sections"
      />

      <div role="tabpanel">
        {tab === "mark" ? (
          <div className="space-y-6">
            <ClassSelectorPanel
              classes={classes}
              isLoadingClasses={isLoadingClasses}
              selectedClassId={selectedClassId}
              onClassChange={(id) => {
                setSelectedClassId(id);
                setStudentsLoaded(false);
              }}
              date={date}
              onDateChange={setDate}
              onLoadStudents={handleLoadStudents}
              isLoadingStudents={false}
            />

            {studentsLoaded && selectedClass ? (
              <AttendanceMarkingPanel
                key={`${selectedClassId}-${date}-${loadToken}`}
                classId={selectedClassId}
                className={selectedClass.name}
                date={date}
                teacherId={teacherId}
                loadToken={loadToken}
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Choose a class and date, then click Load Students to begin.
              </p>
            )}
          </div>
        ) : (
          <AttendanceHistoryPanel teacherId={teacherId} />
        )}
      </div>
    </div>
  );
}
