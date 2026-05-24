import { FieldValue } from "firebase-admin/firestore";

import {
  generateParentPassword,
  generateStudentPassword,
} from "@/lib/auth/credentials";
import { sendWelcomeEmail } from "@/lib/server/email";
import { getAdminApp } from "@/lib/server/firebase-admin";

export type CreateStudentParentInput = {
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  classId: string;
  parentName?: string;
  parentEmail?: string;
  grade?: string;
  section?: string;
};

export type CreateStudentParentResult = {
  studentUid: string;
  parentUid: string | null;
  studentEmail: string;
  parentEmail: string | null;
  studentPassword: string;
  parentPassword: string | null;
  parentReused: boolean;
  emailsSent: { student: boolean; parent: boolean };
  emailWarnings: string[];
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function createAuthUser(
  auth: ReturnType<typeof getAdminApp>["auth"],
  email: string,
  password: string,
  displayName: string,
): Promise<{ uid: string; created: boolean }> {
  try {
    const existing = await auth.getUserByEmail(email);
    return { uid: existing.uid, created: false };
  } catch {
    const user = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
    return { uid: user.uid, created: true };
  }
}

async function linkParentToStudent(
  db: ReturnType<typeof getAdminApp>["db"],
  parentUid: string,
  studentUid: string,
  parentName: string,
  parentEmail: string,
): Promise<void> {
  const parentRef = db.collection("users").doc(parentUid);
  const parentSnap = await parentRef.get();
  const existing = parentSnap.data() ?? {};

  const updates: Record<string, unknown> = {
    role: "parent",
    name: parentName,
    displayName: parentName,
    email: parentEmail,
    updatedAt: new Date(),
  };

  if (Array.isArray(existing.linkedStudentIds)) {
    const ids = new Set(existing.linkedStudentIds as string[]);
    ids.add(studentUid);
    updates.linkedStudentIds = [...ids];
    if (existing.linkedStudentId) {
      updates.linkedStudentId = FieldValue.delete();
    }
  } else if (existing.linkedStudentId && existing.linkedStudentId !== studentUid) {
    updates.linkedStudentIds = [existing.linkedStudentId, studentUid];
    updates.linkedStudentId = FieldValue.delete();
  } else if (!existing.linkedStudentId) {
    updates.linkedStudentId = studentUid;
  }

  if (!parentSnap.exists) {
    updates.createdAt = new Date();
    updates.passwordChanged = false;
    updates.status = "active";
  }

  await parentRef.set(updates, { merge: true });

  await db.collection("parents").doc(parentUid).set(
    {
      name: parentName,
      email: parentEmail,
      updatedAt: new Date(),
    },
    { merge: true },
  );
}

export async function createStudentWithParent(
  input: CreateStudentParentInput,
): Promise<CreateStudentParentResult> {
  const { auth, db } = getAdminApp();

  const studentEmail = input.studentEmail.trim().toLowerCase();
  const parentEmail = input.parentEmail?.trim().toLowerCase() || null;
  const parentName = input.parentName?.trim() || "";
  const rollNumber = input.rollNumber.trim();
  const studentPassword = generateStudentPassword(rollNumber);
  const parentPassword = parentEmail ? generateParentPassword(rollNumber) : null;
  const { firstName, lastName } = splitName(input.studentName);
  const fullName = input.studentName.trim();

  const studentAuth = await createAuthUser(
    auth,
    studentEmail,
    studentPassword,
    fullName,
  );
  const studentUid = studentAuth.uid;

  if (!studentAuth.created) {
    throw new Error(`Student email already in use: ${studentEmail}`);
  }

  await db.collection("users").doc(studentUid).set(
    {
      role: "student",
      name: fullName,
      displayName: fullName,
      email: studentEmail,
      linkedStudentId: studentUid,
      passwordChanged: false,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { merge: true },
  );

  let parentUid: string | null = null;
  let parentReused = false;

  if (parentEmail && parentName) {
    try {
      const parentAuth = await createAuthUser(
        auth,
        parentEmail,
        parentPassword!,
        parentName,
      );
      parentUid = parentAuth.uid;
      parentReused = !parentAuth.created;

      if (parentAuth.created) {
        await db.collection("users").doc(parentUid).set(
          {
            role: "parent",
            name: parentName,
            displayName: parentName,
            email: parentEmail,
            linkedStudentId: studentUid,
            passwordChanged: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true },
        );
      } else {
        await linkParentToStudent(db, parentUid, studentUid, parentName, parentEmail);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Parent creation failed";
      if (!message.includes("email-already-exists") && !message.includes("already in use")) {
        throw error;
      }
      const existing = await auth.getUserByEmail(parentEmail);
      parentUid = existing.uid;
      parentReused = true;
      await linkParentToStudent(db, parentUid, studentUid, parentName, parentEmail);
    }
  }

  const classKey =
    input.grade && input.section
      ? `${input.grade}_${input.section}`
      : null;

  await db.collection("students").doc(studentUid).set(
    {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { merge: true },
  );

  const loginUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const emailWarnings: string[] = [];
  const emailsSent = { student: false, parent: false };

  let studentVerifyLink: string | undefined;
  try {
    studentVerifyLink = await auth.generateEmailVerificationLink(studentEmail);
  } catch {
    studentVerifyLink = undefined;
  }

  const studentEmailResult = await sendWelcomeEmail({
    to: studentEmail,
    name: fullName,
    role: "student",
    loginUrl: `${loginUrl}/login`,
    email: studentEmail,
    tempPassword: studentPassword,
    verificationLink: studentVerifyLink,
  });
  emailsSent.student = studentEmailResult.sent;
  if (!studentEmailResult.sent && studentEmailResult.error) {
    emailWarnings.push(`Student email: ${studentEmailResult.error}`);
  }

  if (parentEmail && parentPassword && parentName) {
    let parentVerifyLink: string | undefined;
    try {
      parentVerifyLink = await auth.generateEmailVerificationLink(parentEmail);
    } catch {
      parentVerifyLink = undefined;
    }

    const parentEmailResult = await sendWelcomeEmail({
      to: parentEmail,
      name: parentName,
      role: "parent",
      loginUrl: `${loginUrl}/login`,
      email: parentEmail,
      tempPassword: parentPassword,
      verificationLink: parentVerifyLink,
    });
    emailsSent.parent = parentEmailResult.sent;
    if (!parentEmailResult.sent && parentEmailResult.error) {
      emailWarnings.push(`Parent email: ${parentEmailResult.error}`);
    }
  }

  return {
    studentUid,
    parentUid,
    studentEmail,
    parentEmail,
    studentPassword,
    parentPassword,
    parentReused,
    emailsSent,
    emailWarnings,
  };
}
