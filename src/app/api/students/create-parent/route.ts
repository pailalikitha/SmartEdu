import { NextResponse } from "next/server";

/**
 * Creates a parent Firebase Auth user when Admin SDK credentials are configured.
 * Set FIREBASE_SERVICE_ACCOUNT_JSON to a JSON service-account string in production.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Parent account creation skipped (Admin SDK not configured).",
      });
    }

    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
      });
    }

    const auth = getAuth();

    try {
      await auth.getUserByEmail(email);
      return NextResponse.json({ success: true, existing: true });
    } catch {
      await auth.createUser({
        email,
        displayName: displayName || email.split("@")[0],
        emailVerified: false,
      });
      return NextResponse.json({ success: true, created: true });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create parent account",
      },
      { status: 500 },
    );
  }
}
