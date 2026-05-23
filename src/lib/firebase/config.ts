import { env, isFirebaseEnvConfigured } from "@/config/env";

export const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
};

export function isFirebaseConfigured(): boolean {
  return isFirebaseEnvConfigured();
}
