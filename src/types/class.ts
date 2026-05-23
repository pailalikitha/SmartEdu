export type ClassRoom = {
  id: string;
  name: string;
  teacherId: string;
  grade?: string;
  section?: string;
  subject?: string;
  academicYear?: string;
  classCode?: string;
  studentCount?: number;
};

export type CreateClassInput = {
  name: string;
  section: string;
  subject: string;
  academicYear: string;
  teacherId: string;
};
