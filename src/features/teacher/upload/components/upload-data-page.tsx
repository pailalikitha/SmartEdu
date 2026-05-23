"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { UploadHistorySection } from "@/features/teacher/upload/components/upload-history-section";
import { UploadMarksSection } from "@/features/teacher/upload/components/upload-marks-section";
import { UploadStudentsSection } from "@/features/teacher/upload/components/upload-students-section";
import { UploadTemplatesSection } from "@/features/teacher/upload/components/upload-templates-section";
import { useAuth } from "@/hooks/use-auth";

export function UploadDataPage() {
  const { user } = useAuth();
  const teacherId = user?.id ?? "";
  const [historyRefresh, setHistoryRefresh] = useState(0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Upload Data"
        description="Import marks and student lists via CSV. Download templates to get started."
      />

      <section className="space-y-4" aria-labelledby="upload-templates-heading">
        <h2 id="upload-templates-heading" className="sr-only">
          Templates
        </h2>
        <UploadTemplatesSection />
      </section>

      <section className="space-y-4" aria-labelledby="upload-marks-heading">
        <h2
          id="upload-marks-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Marks
        </h2>
        <UploadMarksSection
          teacherId={teacherId}
          onUploaded={() => setHistoryRefresh((k) => k + 1)}
        />
      </section>

      <section className="space-y-4" aria-labelledby="upload-students-heading">
        <h2
          id="upload-students-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Students
        </h2>
        <UploadStudentsSection
          teacherId={teacherId}
          onUploaded={() => setHistoryRefresh((k) => k + 1)}
        />
      </section>

      <section className="space-y-4" aria-labelledby="upload-history-heading">
        <h2
          id="upload-history-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Upload history
        </h2>
        <UploadHistorySection
          teacherId={teacherId}
          refreshKey={historyRefresh}
        />
      </section>
    </div>
  );
}
