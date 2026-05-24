import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";

export type StudentNote = {
  id: string;
  note: string;
  teacherId: string;
  createdAt: Date | null;
};

function notesCollection(ownerId: string, studentId: string) {
  const db = requireFirestore();
  return collection(
    db,
    COLLECTIONS.notes,
    ownerId,
    "students",
    studentId,
    "items",
  );
}

export function subscribeStudentNotes(
  ownerId: string,
  studentId: string,
  onData: (notes: StudentNote[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const q = query(
    notesCollection(ownerId, studentId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notes = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAt = data.createdAt;
        return {
          id: d.id,
          note: String(data.note ?? ""),
          teacherId: String(data.teacherId ?? ownerId),
          createdAt:
            createdAt &&
            typeof createdAt === "object" &&
            "toDate" in createdAt
              ? (createdAt as { toDate: () => Date }).toDate()
              : null,
        };
      });
      onData(notes);
    },
    (err) => onError(err.message),
  );
}

export async function addStudentNote(
  ownerId: string,
  studentId: string,
  note: string,
): Promise<void> {
  const db = requireFirestore();
  await addDoc(notesCollection(ownerId, studentId), {
    note: note.trim(),
    teacherId: ownerId,
    createdAt: serverTimestamp(),
  });
}

export async function deleteStudentNote(
  ownerId: string,
  studentId: string,
  noteId: string,
): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(
    doc(db, COLLECTIONS.notes, ownerId, "students", studentId, "items", noteId),
  );
}
