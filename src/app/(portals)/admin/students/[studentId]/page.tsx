import { AdminStudentDetailPage } from "@/features/admin/students/components/admin-student-detail-page";

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function AdminStudentDetailRoute({ params }: PageProps) {
  const { studentId } = await params;
  return <AdminStudentDetailPage studentId={studentId} />;
}
