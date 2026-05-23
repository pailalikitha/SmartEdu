import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { createClass } from "@/services/classes.service";
import { mapClassDoc } from "@/services/classes.service";
import { updateUserProfile } from "@/services/user.service";

export type StudentOnboardingInput = {
  uid: string;
  email: string;
  name: string;
  rollNumber: string;
  parentEmail: string;
  parentPhone?: string;
  classId: string;
  grade: string;
  section: string;
};

export async function findClassByCode(classCode: string) {
  const db = requireFirestore();
  const normalized = classCode.trim().toUpperCase();
  const q = query(
    collection(db, COLLECTIONS.classes),
    where("classCode", "==", normalized),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return mapClassDoc(docSnap.id, docSnap.data());
}

export async function studentNeedsOnboarding(uid: string): Promise<boolean> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.students, uid));
  if (!snapshot.exists()) return true;
  const data = snapshot.data();
  return !data.classId;
}

export async function completeStudentOnboarding(
  input: StudentOnboardingInput,
): Promise<void> {
  const db = requireFirestore();
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  await setDoc(
    doc(db, COLLECTIONS.students, input.uid),
    {
      firstName,
      lastName,
      email: input.email.trim().toLowerCase(),
      rollNumber: input.rollNumber.trim(),
      grade: input.grade,
      section: input.section,
      classId: input.classId,
      classKey: `${input.grade}_${input.section}`,
      authUserId: input.uid,
      guardianName: null,
      guardianContact: input.parentPhone?.trim() ?? null,
      parentEmail: input.parentEmail.trim().toLowerCase(),
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await updateUserProfile(input.uid, {
    displayName: input.name.trim(),
  });
}

export async function completeTeacherOnboarding(input: {
  uid: string;
  email: string;
  name: string;
  subject: string;
  phone: string;
  className: string;
  section: string;
  grade: string;
}): Promise<{ classId: string; classCode: string }> {
  const db = requireFirestore();

  await setDoc(
    doc(db, COLLECTIONS.teachers, input.uid),
    {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      subjects: [input.subject.trim()],
      phone: input.phone.trim(),
      employeeId: `TCH-${input.uid.slice(0, 6).toUpperCase()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await updateUserProfile(input.uid, {
    displayName: input.name.trim(),
  });

  const { id, classCode } = await createClass({
    name: input.className.trim(),
    section: input.section.trim(),
    subject: input.subject.trim(),
    academicYear: new Date().getFullYear().toString(),
    teacherId: input.uid,
  });

  return { classId: id, classCode };
}
