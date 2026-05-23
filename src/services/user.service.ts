import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";

import type { UserRole } from "@/constants/roles";
import { getFirebaseDb } from "@/lib/firebase/client";

export type UserProfile = {
  email: string;
  displayName: string;
  role: UserRole;
  schoolId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const USERS_COLLECTION = "users";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function createUserProfile(
  uid: string,
  data: Pick<UserProfile, "email" | "displayName" | "role">,
): Promise<void> {
  await setDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function ensureUserProfile(
  uid: string,
  data: Pick<UserProfile, "email" | "displayName" | "role">,
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;
  await createUserProfile(uid, data);
  return { ...data };
}
