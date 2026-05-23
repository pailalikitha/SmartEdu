"use client";

import { AlertCircle } from "lucide-react";

import { Text } from "@/components/ui";
import { getMissingFirebaseEnvKeys } from "@/config/env";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseConfigAlert() {
  if (isFirebaseConfigured()) return null;

  const missing = getMissingFirebaseEnvKeys();

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-warning/30 bg-accent/80 px-3 py-3"
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-warning"
        aria-hidden
      />
      <div className="space-y-1">
        <Text variant="small" className="font-medium text-foreground">
          Firebase not configured
        </Text>
        <Text variant="caption" as="p">
          Copy <code className="rounded bg-muted px-1">.env.example</code> to{" "}
          <code className="rounded bg-muted px-1">.env.local</code> and set:{" "}
          {missing.join(", ")}. Enable Email/Password in Firebase Authentication.
        </Text>
      </div>
    </div>
  );
}
