import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and add your keys.",
    );
  }

  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
