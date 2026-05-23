import type { Metadata } from "next";

import { StudentMarksPage } from "@/features/student/marks";

export const metadata: Metadata = {
  title: "Marks Analysis",
};

export default function StudentMarksRoutePage() {
  return <StudentMarksPage />;
}
