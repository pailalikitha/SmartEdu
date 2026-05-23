"use client";

import { ClipboardList, FileBarChart } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTabs } from "@/components/layout/responsive-tabs";
import { MarkAttendancePanel } from "@/features/attendance/components/mark-attendance-panel";
import { MonthlyReportPanel } from "@/features/attendance/components/monthly-report-panel";

const TABS = [
  { id: "mark" as const, label: "Mark attendance", shortLabel: "Mark", icon: ClipboardList },
  { id: "report" as const, label: "Monthly report", shortLabel: "Report", icon: FileBarChart },
];

export function AttendanceTracking() {
  const [tab, setTab] = useState<"mark" | "report">("mark");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance, view monthly reports, and analyze trends."
      />

      <ResponsiveTabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        ariaLabel="Attendance sections"
      />

      <div role="tabpanel">{tab === "mark" ? <MarkAttendancePanel /> : <MonthlyReportPanel />}</div>
    </div>
  );
}
