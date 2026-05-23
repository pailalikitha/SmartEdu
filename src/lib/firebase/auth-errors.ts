import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Invalid email",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Wrong password",
  "auth/invalid-credential": "Wrong password",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/operation-not-allowed": "Email sign-in is not enabled for this project.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      AUTH_ERROR_MESSAGES[error.code] ??
      error.message ??
      "Authentication failed. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
