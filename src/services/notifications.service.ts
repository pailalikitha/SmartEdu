import { collection, doc, serverTimestamp } from "firebase/firestore";

import {
  COLLECTIONS,
  NOTIFICATION_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { runBatchedSet } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";

export async function sendTeacherAlertNotification(
  studentId: string,
  message: string,
): Promise<void> {
  const db = requireFirestore();
  const ref = doc(
    collection(
      db,
      COLLECTIONS.notifications,
      studentId,
      NOTIFICATION_SUBCOLLECTIONS.items,
    ),
  );

  await runBatchedSet(db, [
    {
      ref,
      data: {
        message,
        type: "teacher_alert",
        read: false,
        createdAt: serverTimestamp(),
      },
    },
  ]);
}
