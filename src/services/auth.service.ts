import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";

import type { UserRole } from "@/constants/roles";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  createUserProfile,
  getUserProfile,
} from "@/services/user.service";
import type { User } from "@/types";

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

export type SignInInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

function mapFirebaseUser(firebaseUser: FirebaseUser, role: UserRole): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName,
    role,
    photoURL: firebaseUser.photoURL,
  };
}

export async function mapFirebaseUserWithProfile(
  firebaseUser: FirebaseUser,
): Promise<User> {
  const profile = await getUserProfile(firebaseUser.uid);

  if (!profile) {
    throw new Error("User not found");
  }

  const displayName =
    firebaseUser.displayName ?? profile.displayName ?? null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? profile.email ?? "",
    displayName: displayName ?? profile.name ?? null,
    role: profile.role,
    schoolId: profile.schoolId,
    photoURL: firebaseUser.photoURL ?? profile.photoURL ?? null,
    passwordChanged: profile.passwordChanged ?? true,
    linkedStudentId: profile.linkedStudentId,
    linkedStudentIds: profile.linkedStudentIds,
  };
}

export async function signIn({
  email,
  password,
  rememberMe = true,
}: SignInInput): Promise<User> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add keys to .env.local (see .env.example).",
    );
  }

  const auth = getFirebaseAuth();

  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );

    const credential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserWithProfile(credential.user);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add keys to .env.local (see .env.example).",
    );
  }

  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signUp({
  email,
  password,
  displayName,
  role,
}: SignUpInput): Promise<User> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add keys to .env.local (see .env.example).",
    );
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );

    await updateProfile(credential.user, { displayName });
    await createUserProfile(credential.user.uid, {
      email,
      displayName,
      role,
    });

    return mapFirebaseUser(credential.user, role);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function logOut(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await signOut(getFirebaseAuth());
}

export async function getIdToken(): Promise<string | null> {
  const currentUser = getFirebaseAuth().currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

export async function persistSession(role?: User["role"]): Promise<void> {
  const idToken = await getIdToken();
  if (!idToken) return;

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, role }),
  });

  if (!response.ok) {
    throw new Error("Failed to persist session.");
  }
}

export async function clearSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}
