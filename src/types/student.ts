export type StudentStatus = "active" | "inactive";

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  grade: string;
  section: string;
  /** Denormalized `grade_section` for indexed class queries */
  classKey?: string;
  /** Assigned class document id from `classes` collection */
  classId?: string;
  /** Firebase Auth UID when it differs from the student document id */
  authUserId?: string;
  guardianName?: string;
  guardianContact?: string;
  parentEmail?: string;
  parentUid?: string;
  uid?: string;
  atRisk?: boolean;
  status: StudentStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StudentInput = {
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  grade: string;
  section: string;
  guardianName?: string;
  guardianContact?: string;
  status: StudentStatus;
};

export function buildStudentClassKey(grade: string, section: string): string {
  return `${grade}_${section}`;
}

export function getStudentFullName(student: Pick<Student, "firstName" | "lastName">) {
  return `${student.firstName} ${student.lastName}`.trim();
}

export function getStudentClassLabel(student: Pick<Student, "grade" | "section">) {
  return `Grade ${student.grade}-${student.section}`;
}
