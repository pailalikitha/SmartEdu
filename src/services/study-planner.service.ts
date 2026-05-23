import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { runBatchedSet, toDate } from "@/lib/firebase/firestore/helpers";
import { getWeekStart, toDateString } from "@/lib/utils/date";
import {
  orderBy,
  queryCollection,
  requireFirestore,
  where,
} from "@/lib/firebase/firestore/query";
import type { StudyTask, StudyTaskInput, TaskStatus } from "@/types/study-planner";

export function getStudyTaskDocId(
  studentId: string,
  scheduledDate: string,
  startTime?: string,
): string {
  const timePart = (startTime ?? "00:00").replace(":", "");
  const datePart = scheduledDate.replace(/-/g, "");
  return `${studentId}_${datePart}_${timePart}`;
}

function mapTaskDoc(id: string, data: DocumentData): StudyTask {
  return {
    id,
    studentId: String(data.studentId ?? ""),
    title: String(data.title ?? ""),
    subject: String(data.subject ?? ""),
    topic: String(data.topic ?? ""),
    scheduledDate: String(data.scheduledDate ?? ""),
    startTime: data.startTime ? String(data.startTime) : undefined,
    durationMinutes: Number(data.durationMinutes ?? 45),
    status: (data.status as TaskStatus) ?? "pending",
    priority:
      data.priority === "high" || data.priority === "low"
        ? data.priority
        : "medium",
    source: data.source === "manual" ? "manual" : "ai",
    notes: data.notes ? String(data.notes) : undefined,
    createdAt: toDate(data.createdAt as Timestamp | undefined),
    updatedAt: toDate(data.updatedAt as Timestamp | undefined),
  };
}

function resolveWeekKey(scheduledDate: string, weekKey?: string): string {
  if (weekKey) return weekKey;
  return toDateString(getWeekStart(new Date(`${scheduledDate}T12:00:00`)));
}

function toFirestoreTask(
  input: StudyTaskInput,
  weekKey?: string,
): DocumentData {
  return {
    studentId: input.studentId,
    title: input.title.trim(),
    subject: input.subject,
    topic: input.topic.trim(),
    scheduledDate: input.scheduledDate,
    weekKey: resolveWeekKey(input.scheduledDate, weekKey),
    startTime: input.startTime ?? null,
    durationMinutes: input.durationMinutes,
    status: input.status,
    priority: input.priority,
    source: input.source,
    notes: input.notes?.trim() ?? null,
  };
}

/** @deprecated Prefer listStudyTasksInRange for week-scoped reads */
export async function listStudyTasks(studentId: string): Promise<StudyTask[]> {
  const { items } = await queryCollection({
    collectionPath: COLLECTIONS.studyTasks,
    constraints: [
      where("studentId", "==", studentId),
      orderBy("scheduledDate", "asc"),
      orderBy("startTime", "asc"),
    ],
    mapDoc: mapTaskDoc,
  });
  return items;
}

/** Week-scoped query — reads only tasks in the date window */
export async function listStudyTasksInRange(
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<StudyTask[]> {
  const { items } = await queryCollection({
    collectionPath: COLLECTIONS.studyTasks,
    constraints: [
      where("studentId", "==", studentId),
      where("scheduledDate", ">=", startDate),
      where("scheduledDate", "<=", endDate),
      orderBy("scheduledDate", "asc"),
      orderBy("startTime", "asc"),
    ],
    mapDoc: mapTaskDoc,
  });
  return items;
}

/** Uses weekKey partition when startDate is a Monday (week start) */
export async function listStudyTasksForWeek(
  studentId: string,
  weekStartDate: string,
): Promise<StudyTask[]> {
  const { items } = await queryCollection({
    collectionPath: COLLECTIONS.studyTasks,
    constraints: [
      where("studentId", "==", studentId),
      where("weekKey", "==", weekStartDate),
      orderBy("scheduledDate", "asc"),
      orderBy("startTime", "asc"),
    ],
    mapDoc: mapTaskDoc,
  });
  return items;
}

export async function createStudyTask(
  input: StudyTaskInput,
  options?: { deterministicId?: boolean },
): Promise<StudyTask> {
  const db = requireFirestore();
  const weekKey = input.scheduledDate;
  const useDeterministic = options?.deterministicId ?? input.source === "ai";

  const ref = useDeterministic
    ? doc(
        db,
        COLLECTIONS.studyTasks,
        getStudyTaskDocId(
          input.studentId,
          input.scheduledDate,
          input.startTime,
        ),
      )
    : doc(collection(db, COLLECTIONS.studyTasks));

  const payload = {
    ...toFirestoreTask(input, weekKey),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await runBatchedSet(db, [{ ref, data: payload, merge: useDeterministic }]);

  return {
    id: ref.id,
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createStudyTasks(
  inputs: StudyTaskInput[],
  weekKey?: string,
): Promise<StudyTask[]> {
  if (inputs.length === 0) return [];

  const db = requireFirestore();
  const operations = inputs.map((input) => {
    const id = getStudyTaskDocId(
      input.studentId,
      input.scheduledDate,
      input.startTime,
    );
    return {
      ref: doc(db, COLLECTIONS.studyTasks, id),
      data: {
        ...toFirestoreTask(input, weekKey ?? input.scheduledDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      merge: true,
    };
  });

  await runBatchedSet(db, operations);

  return inputs.map((input) => ({
    id: getStudyTaskDocId(
      input.studentId,
      input.scheduledDate,
      input.startTime,
    ),
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function updateStudyTask(
  id: string,
  patch: Partial<StudyTaskInput>,
): Promise<void> {
  const db = requireFirestore();

  await updateDoc(doc(db, COLLECTIONS.studyTasks, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStudyTask(id: string): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, COLLECTIONS.studyTasks, id));
}

export async function toggleTaskComplete(
  task: StudyTask,
): Promise<TaskStatus> {
  const next: TaskStatus =
    task.status === "completed" ? "pending" : "completed";
  await updateStudyTask(task.id, { status: next });
  return next;
}
