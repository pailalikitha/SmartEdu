import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  deleteField,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { getSecondaryFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { generateParentPassword, generateStudentPassword } from "@/lib/auth/credentials";
import type { CreateStudentParentInput } from "@/lib/server/create-student-parent";

export type CreateStudentParentResponse = {
  success: boolean;
  error?: string;
  studentUid?: string;
  parentUid?: string | null;
  studentEmail?: string;
  parentEmail?: string | null;
  studentPassword?: string;
  parentPassword?: string | null;
  parentReused?: boolean;
  emailsSent?: { student: boolean; parent: boolean };
  emailWarnings?: string[];
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function createStudentWithParentAccount(
  input: CreateStudentParentInput,
): Promise<CreateStudentParentResponse> {
  const secondaryAuth = getSecondaryFirebaseAuth();
  const db = getFirebaseDb();

  const studentEmail = input.studentEmail.trim().toLowerCase();
  const parentEmail = input.parentEmail?.trim().toLowerCase() || null;
  const parentName = input.parentName?.trim() || "";
  const rollNumber = input.rollNumber.trim();
  const studentPassword = generateStudentPassword(rollNumber);
  const parentPassword = parentEmail ? generateParentPassword(rollNumber) : null;
  const { firstName, lastName } = splitName(input.studentName);
  const fullName = input.studentName.trim();

  let studentUid: string;

  try {
    const studentCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      studentEmail,
      studentPassword
    );
    studentUid = studentCredential.user.uid;
    
    await updateProfile(studentCredential.user, {
      displayName: fullName,
    });
  } catch (error: any) {
    throw new Error(error?.message || "Student email already in use or creation failed");
  }

  await setDoc(doc(db, "users", studentUid), {
    role: "student",
    name: fullName,
    displayName: fullName,
    email: studentEmail,
    linkedStudentId: studentUid,
    passwordChanged: false,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  let parentUid: string | null = null;
  let parentReused = false;

  if (parentEmail && parentName && parentPassword) {
    try {
      const parentCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        parentEmail,
        parentPassword
      );
      parentUid = parentCredential.user.uid;
      
      await updateProfile(parentCredential.user, {
        displayName: parentName,
      });

      await setDoc(doc(db, "users", parentUid), {
        role: "parent",
        name: parentName,
        displayName: parentName,
        email: parentEmail,
        linkedStudentId: studentUid,
        passwordChanged: false,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await setDoc(doc(db, "parents", parentUid), {
        name: parentName,
        email: parentEmail,
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", parentEmail), where("role", "==", "parent"));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          parentUid = querySnapshot.docs[0].id;
          parentReused = true;
          
          const existing = querySnapshot.docs[0].data();
          const updates: any = { updatedAt: serverTimestamp() };
          
          if (Array.isArray(existing.linkedStudentIds)) {
            updates.linkedStudentIds = arrayUnion(studentUid);
            if (existing.linkedStudentId) {
               updates.linkedStudentId = deleteField();
            }
          } else if (existing.linkedStudentId && existing.linkedStudentId !== studentUid) {
            updates.linkedStudentIds = [existing.linkedStudentId, studentUid];
            updates.linkedStudentId = deleteField();
          } else if (!existing.linkedStudentId) {
            updates.linkedStudentId = studentUid;
          }
          
          await updateDoc(doc(db, "users", parentUid), updates);
        } else {
           throw new Error("Parent email already in use by a non-parent user.");
        }
      } else {
        throw new Error(error?.message || "Parent creation failed");
      }
    }
  }

  const classKey =
    input.grade && input.section
      ? `${input.grade}_${input.section}`
      : null;

  await setDoc(doc(db, "students", studentUid), {
    firstName,
    lastName,
    name: fullName,
    email: studentEmail,
    rollNumber,
    rollNo: rollNumber,
    grade: input.grade ?? "",
    section: input.section ?? "",
    classId: input.classId,
    classKey,
    authUserId: studentUid,
    uid: studentUid,
    parentEmail: parentEmail ?? null,
    parentUid: parentUid ?? null,
    guardianName: parentName || null,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await secondaryAuth.signOut();

  return {
    success: true,
    studentUid,
    parentUid,
    studentEmail,
    parentEmail,
    studentPassword,
    parentPassword,
    parentReused,
    emailsSent: { student: false, parent: false },
    emailWarnings: ["Emails are not sent from the client-side directly."],
  };
}

export type BulkCreateResult = {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    row: number;
    success: boolean;
    studentEmail?: string;
    error?: string;
    credentials?: {
      studentEmail: string;
      studentPassword: string;
      parentEmail: string | null;
      parentPassword: string | null;
    };
  }>;
  error?: string;
};

export async function bulkCreateStudentsWithParents(
  rows: CreateStudentParentInput[],
): Promise<BulkCreateResult> {
  let successCount = 0;
  let failureCount = 0;
  const results: BulkCreateResult["results"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const res = await createStudentWithParentAccount(row);
      successCount++;
      results.push({
        row: i + 1,
        success: true,
        studentEmail: res.studentEmail,
        credentials: {
          studentEmail: res.studentEmail!,
          studentPassword: res.studentPassword!,
          parentEmail: res.parentEmail || null,
          parentPassword: res.parentPassword || null,
        }
      });
    } catch (err: any) {
      failureCount++;
      results.push({
        row: i + 1,
        success: false,
        studentEmail: row.studentEmail,
        error: err.message || "Failed to create",
      });
    }
  }

  return {
    success: successCount > 0,
    successCount,
    failureCount,
    results,
  };
}
