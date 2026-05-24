import { TeacherStudentDetailPage } from "@/features/teacher/students/components/teacher-student-detail-page";

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function TeacherStudentDetailRoute({ params }: PageProps) {
  const { studentId } = await params;
  return <TeacherStudentDetailPage studentId={studentId} />;
}
