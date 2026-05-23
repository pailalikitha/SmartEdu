import type { Metadata } from "next";

import { StudentManagement } from "@/features/admin/students/components/student-management";

export const metadata: Metadata = {
  title: "Students",
};

export default function AdminStudentsPage() {
  return <StudentManagement />;
}
