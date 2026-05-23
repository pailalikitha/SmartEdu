/**
 * Client-safe environment variables (NEXT_PUBLIC_*).
 * Copy `.env.example` → `.env.local` and fill values from Firebase Console.
 */

const firebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  firebase,
} as const;

/** Required Firebase keys for Email/Password auth */
export const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const FIREBASE_KEY_TO_VALUE: Record<(typeof FIREBASE_ENV_KEYS)[number], string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: firebase.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebase.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebase.projectId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebase.appId,
};

export function isFirebaseEnvConfigured(): boolean {
  return FIREBASE_ENV_KEYS.every((key) => Boolean(FIREBASE_KEY_TO_VALUE[key]));
}

export function getMissingFirebaseEnvKeys(): (typeof FIREBASE_ENV_KEYS)[number][] {
  return FIREBASE_ENV_KEYS.filter((key) => !FIREBASE_KEY_TO_VALUE[key]);
}
