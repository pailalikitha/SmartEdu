import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  COLLECTIONS,
  NOTIFICATION_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { runBatchedSet } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";

export type NotificationType =
  | "marks_uploaded"
  | "attendance_marked"
  | "weak_topic_alert"
  | "assignment_posted"
  | "teacher_alert"
  | "system";

export type AppNotification = {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date | null;
};

export type CreateNotificationInput = {
  message: string;
  type: NotificationType;
  link?: string;
  read?: boolean;
};

function notificationCollection(userId: string) {
  const db = requireFirestore();
  return collection(
    db,
    COLLECTIONS.notifications,
    userId,
    NOTIFICATION_SUBCOLLECTIONS.items,
  );
}

function mapNotification(
  id: string,
  data: Record<string, unknown>,
): AppNotification {
  const createdAt = data.createdAt;
  return {
    id,
    message: String(data.message ?? ""),
    type: (data.type as NotificationType) ?? "system",
    read: Boolean(data.read),
    link: data.link ? String(data.link) : undefined,
    createdAt:
      createdAt && typeof createdAt === "object" && "toDate" in createdAt
        ? (createdAt as { toDate: () => Date }).toDate()
        : null,
  };
}

export async function createNotification(
  userId: string,
  input: CreateNotificationInput,
): Promise<void> {
  const db = requireFirestore();
  const ref = doc(notificationCollection(userId));

  await runBatchedSet(db, [
    {
      ref,
      data: {
        message: input.message,
        type: input.type,
        read: input.read ?? false,
        link: input.link ?? null,
        createdAt: serverTimestamp(),
      },
    },
  ]);
}

export async function createNotificationsForUsers(
  userIds: string[],
  input: CreateNotificationInput,
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return;

  await Promise.all(
    unique.map((userId) => createNotification(userId, input)),
  );
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(
    doc(
      db,
      COLLECTIONS.notifications,
      userId,
      NOTIFICATION_SUBCOLLECTIONS.items,
      notificationId,
    ),
    { read: true },
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(notificationCollection(userId), where("read", "==", false)),
  );

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  for (const docSnap of snapshot.docs) {
    batch.update(docSnap.ref, { read: true });
  }
  await batch.commit();
}

export async function deleteReadNotifications(userId: string): Promise<void> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(notificationCollection(userId), where("read", "==", true)),
  );

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  for (const docSnap of snapshot.docs) {
    batch.delete(docSnap.ref);
  }
  await batch.commit();
}

export async function listNotifications(
  userId: string,
  max = 50,
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(
      notificationCollection(userId),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );

  return snapshot.docs.map((d) =>
    mapNotification(d.id, d.data() as Record<string, unknown>),
  );
}

export async function sendTeacherAlertNotification(
  studentId: string,
  message: string,
): Promise<void> {
  await createNotification(studentId, {
    message,
    type: "teacher_alert",
    read: false,
  });
}

export async function notifyMarksUploaded(
  studentIds: string[],
  subject: string,
): Promise<void> {
  await createNotificationsForUsers(studentIds, {
    message: `Your ${subject} marks have been uploaded`,
    type: "marks_uploaded",
    link: "/student/marks",
    read: false,
  });
}

export async function notifyAbsent(
  studentId: string,
  date: string,
): Promise<void> {
  await createNotification(studentId, {
    message: `You were marked absent on ${date}`,
    type: "attendance_marked",
    link: "/student/attendance",
    read: false,
  });
}

export async function notifyLowAttendance(
  studentId: string,
  percent: number,
): Promise<void> {
  await createNotification(studentId, {
    message: `Warning: Your attendance is now ${percent}%. Minimum is 75%`,
    type: "weak_topic_alert",
    read: false,
  });
}

export async function notifyWeakSubject(
  studentId: string,
  subject: string,
  average: number,
): Promise<void> {
  await createNotification(studentId, {
    message: `You need attention in ${subject}. Average: ${average}%`,
    type: "weak_topic_alert",
    link: "/student/weak-topics",
    read: false,
  });
}
