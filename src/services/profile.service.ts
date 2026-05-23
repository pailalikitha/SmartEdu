import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { toDate } from "@/lib/firebase/firestore/helpers";
import { getFirebaseStorage } from "@/lib/firebase/client";
import { updateUserProfile } from "@/services/user.service";
import { listClassesByTeacher } from "@/services/classes.service";
import type { Timestamp } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

export type StudentProfileDoc = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  grade: string;
  section: string;
  classId?: string;
  phone?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  photoURL?: string | null;
  createdAt?: Date;
};

export async function getStudentProfileDoc(
  uid: string,
): Promise<StudentProfileDoc | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.students, uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    uid,
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    rollNumber: String(data.rollNumber ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    classId: data.classId ? String(data.classId) : undefined,
    phone: data.phone ? String(data.phone) : undefined,
    dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth) : undefined,
    parentName: data.guardianName ? String(data.guardianName) : undefined,
    parentEmail: data.parentEmail ? String(data.parentEmail) : undefined,
    parentPhone: data.guardianContact
      ? String(data.guardianContact)
      : undefined,
    photoURL: data.photoURL ? String(data.photoURL) : null,
    createdAt: toDate(data.createdAt as Timestamp | undefined),
  };
}

export async function saveStudentProfile(
  uid: string,
  patch: Partial<
    Pick<
      StudentProfileDoc,
      | "firstName"
      | "lastName"
      | "phone"
      | "dateOfBirth"
      | "parentName"
      | "parentEmail"
      | "parentPhone"
      | "photoURL"
    >
  >,
): Promise<void> {
  const db = requireFirestore();
  const displayName = [patch.firstName, patch.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  await updateDoc(doc(db, COLLECTIONS.students, uid), {
    ...(patch.firstName !== undefined ? { firstName: patch.firstName } : {}),
    ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    ...(patch.dateOfBirth !== undefined
      ? { dateOfBirth: patch.dateOfBirth }
      : {}),
    ...(patch.parentName !== undefined
      ? { guardianName: patch.parentName }
      : {}),
    ...(patch.parentEmail !== undefined
      ? { parentEmail: patch.parentEmail }
      : {}),
    ...(patch.parentPhone !== undefined
      ? { guardianContact: patch.parentPhone }
      : {}),
    ...(patch.photoURL !== undefined ? { photoURL: patch.photoURL } : {}),
    updatedAt: serverTimestamp(),
  });

  if (displayName) {
    await updateUserProfile(uid, {
      displayName,
      ...(patch.photoURL !== undefined ? { photoURL: patch.photoURL } : {}),
    });
  }
}

export async function uploadProfileAvatar(
  uid: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  const storage = getFirebaseStorage();
  const objectRef = ref(storage, `profiles/${uid}/avatar.jpg`);
  const task = uploadBytesResumable(objectRef, file, {
    contentType: file.type || "image/jpeg",
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(percent));
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

export async function getTeacherAssignedClasses(teacherId: string) {
  return listClassesByTeacher(teacherId);
}
