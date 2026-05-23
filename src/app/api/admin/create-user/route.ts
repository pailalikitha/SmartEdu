import { NextResponse } from "next/server";

import type { UserRole } from "@/constants/roles";

type CreateUserBody = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  subject?: string;
  classId?: string;
  rollNumber?: string;
  parentEmail?: string;
  grade?: string;
  section?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUserBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const displayName = body.displayName?.trim();
    const role = body.role;

    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return NextResponse.json(
        {
          success: false,
          error:
            "FIREBASE_SERVICE_ACCOUNT_JSON is not configured. Cannot create users server-side.",
        },
        { status: 503 },
      );
    }

    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirestore } = await import("firebase-admin/firestore");

    if (getApps().length === 0) {
      initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
    }

    const auth = getAuth();
    const db = getFirestore();

    let uid: string;
    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const user = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });
      uid = user.uid;
    }

    await db.collection("users").doc(uid).set(
      {
        email,
        displayName,
        role,
        status: "active",
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      { merge: true },
    );

    if (role === "teacher") {
      await db.collection("teachers").doc(uid).set(
        {
          name: displayName,
          email,
          phone: body.phone ?? null,
          subject: body.subject ?? null,
          subjects: body.subject ? [body.subject] : [],
          status: "active",
          updatedAt: new Date(),
        },
        { merge: true },
      );
    }

    if (role === "student") {
      const [firstName, ...rest] = displayName.split(/\s+/);
      await db.collection("students").doc(uid).set(
        {
          firstName,
          lastName: rest.join(" ") || firstName,
          email,
          rollNumber: body.rollNumber ?? "",
          grade: body.grade ?? "",
          section: body.section ?? "",
          classId: body.classId ?? null,
          classKey:
            body.grade && body.section
              ? `${body.grade}_${body.section}`
              : null,
          authUserId: uid,
          parentEmail: body.parentEmail ?? null,
          status: "active",
          updatedAt: new Date(),
        },
        { merge: true },
      );
    }

    if (role === "parent" && body.parentEmail) {
      await db.collection("parents").doc(uid).set(
        {
          name: displayName,
          email,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    }

    return NextResponse.json({ success: true, uid });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 },
    );
  }
}
