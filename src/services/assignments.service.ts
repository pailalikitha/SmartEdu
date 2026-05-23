import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import {
  ASSIGNMENT_SUBCOLLECTIONS,
  COLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { toDate } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { createNotificationsForUsers } from "@/services/notifications.service";
import { listStudentsByClassIds } from "@/services/student.service";
import type {
  Assignment,
  AssignmentInput,
  AssignmentPriority,
  AssignmentStatus,
  AssignmentSubmission,
} from "@/types/assignment";

function mapAssignment(
  id: string,
  classId: string,
  data: DocumentData,
): Assignment {
  const due = toDate(data.dueDate as Timestamp | undefined) ?? new Date();
  return {
    id,
    classId,
    title: String(data.title ?? ""),
    subject: String(data.subject ?? ""),
    teacherId: String(data.teacherId ?? ""),
    teacherName: data.teacherName ? String(data.teacherName) : undefined,
    description: String(data.description ?? ""),
    dueDate: due,
    priority: (data.priority as AssignmentPriority) ?? "medium",
    status: (data.status as AssignmentStatus) ?? "open",
    createdAt: toDate(data.createdAt as Timestamp | undefined) ?? null,
  };
}

function taskRef(classId: string, taskId: string) {
  const db = requireFirestore();
  return doc(
    db,
    COLLECTIONS.assignments,
    classId,
    ASSIGNMENT_SUBCOLLECTIONS.tasks,
    taskId,
  );
}

function submissionRef(classId: string, taskId: string, studentId: string) {
  const db = requireFirestore();
  return doc(
    db,
    COLLECTIONS.assignments,
    classId,
    ASSIGNMENT_SUBCOLLECTIONS.tasks,
    taskId,
    ASSIGNMENT_SUBCOLLECTIONS.submissions,
    studentId,
  );
}

export async function createAssignment(
  teacherId: string,
  teacherName: string,
  input: AssignmentInput,
): Promise<string> {
  const db = requireFirestore();
  const ref = doc(
    collection(
      db,
      COLLECTIONS.assignments,
      input.classId,
      ASSIGNMENT_SUBCOLLECTIONS.tasks,
    ),
  );

  await setDoc(ref, {
    title: input.title.trim(),
    subject: input.subject.trim(),
    classId: input.classId,
    teacherId,
    teacherName,
    description: input.description.trim(),
    dueDate: input.dueDate,
    priority: input.priority,
    status: "open",
    createdAt: serverTimestamp(),
  });

  const students = await listStudentsByClassIds([input.classId]);
  const studentIds = students
    .map((s) => s.authUserId ?? s.id)
    .filter(Boolean);

  const dueLabel = input.dueDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  await createNotificationsForUsers(studentIds, {
    message: `${input.subject} assignment posted. Due: ${dueLabel}`,
    type: "assignment_posted",
    link: "/student/assignments",
    read: false,
  });

  return ref.id;
}

export async function deleteAssignment(
  classId: string,
  taskId: string,
): Promise<void> {
  const db = requireFirestore();
  const submissionsSnap = await getDocs(
    collection(
      db,
      COLLECTIONS.assignments,
      classId,
      ASSIGNMENT_SUBCOLLECTIONS.tasks,
      taskId,
      ASSIGNMENT_SUBCOLLECTIONS.submissions,
    ),
  );

  for (const sub of submissionsSnap.docs) {
    await deleteDoc(sub.ref);
  }

  await deleteDoc(taskRef(classId, taskId));
}

export async function submitAssignment(
  classId: string,
  taskId: string,
  studentId: string,
  studentName: string,
): Promise<void> {
  await setDoc(submissionRef(classId, taskId, studentId), {
    studentId,
    studentName,
    submittedAt: serverTimestamp(),
    status: "submitted",
  });
}

export async function listSubmissions(
  classId: string,
  taskId: string,
): Promise<AssignmentSubmission[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    collection(
      db,
      COLLECTIONS.assignments,
      classId,
      ASSIGNMENT_SUBCOLLECTIONS.tasks,
      taskId,
      ASSIGNMENT_SUBCOLLECTIONS.submissions,
    ),
  );

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      studentId: String(data.studentId ?? d.id),
      studentName: String(data.studentName ?? ""),
      submittedAt: toDate(data.submittedAt as Timestamp | undefined) ?? null,
      status: data.status === "submitted" ? "submitted" : "pending",
    };
  });
}

export async function notifyOverdueAssignment(
  studentId: string,
  title: string,
  dueDate: Date,
): Promise<void> {
  const { createNotification } = await import(
    "@/services/notifications.service"
  );
  const dueLabel = dueDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  await createNotification(studentId, {
    message: `Overdue: ${title} was due on ${dueLabel}`,
    type: "weak_topic_alert",
    link: "/student/assignments",
    read: false,
  });
}

export { mapAssignment, ASSIGNMENT_SUBCOLLECTIONS, COLLECTIONS };
