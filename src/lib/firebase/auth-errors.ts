import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
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
