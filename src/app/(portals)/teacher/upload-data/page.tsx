import type { Metadata } from "next";

import { UploadDataPage } from "@/features/teacher/upload";

export const metadata: Metadata = {
  title: "Upload Data",
};

export default function TeacherUploadDataRoutePage() {
  return <UploadDataPage />;
}
