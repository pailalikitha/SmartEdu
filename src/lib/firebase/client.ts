import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let secondaryApp: FirebaseApp | undefined;
let secondaryAuth: Auth | undefined;

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

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export function getSecondaryFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "Secondary");
  }
  if (!secondaryAuth) {
    secondaryAuth = getAuth(secondaryApp);
  }
  return secondaryAuth;
}
