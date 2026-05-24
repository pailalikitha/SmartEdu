import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function getAdminApp() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not configured. Cannot run server-side user creation.",
    );
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  }

  return { auth: getAuth(), db: getFirestore() };
}
