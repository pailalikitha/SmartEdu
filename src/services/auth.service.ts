import {
  createUserWithEmailAndPassword,
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
  ensureUserProfile,
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
};

function mapFirebaseUser(firebaseUser: FirebaseUser, role: UserRole): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName,
    role,
  };
}

export async function mapFirebaseUserWithProfile(
  firebaseUser: FirebaseUser,
): Promise<User> {
  const profile = await getUserProfile(firebaseUser.uid);

  const role = profile?.role ?? "student";
  const displayName =
    firebaseUser.displayName ?? profile?.displayName ?? null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? profile?.email ?? "",
    displayName,
    role,
    schoolId: profile?.schoolId,
  };
}

export async function signIn({ email, password }: SignInInput): Promise<User> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add keys to .env.local (see .env.example).",
    );
  }

  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );

    await ensureUserProfile(credential.user.uid, {
      email: credential.user.email ?? email,
      displayName: credential.user.displayName ?? email.split("@")[0],
      role: "student",
    });

    return mapFirebaseUserWithProfile(credential.user);
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
