"use client";

import { updatePassword } from "firebase/auth";
import { useState } from "react";

import { Button, FormField, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  getPasswordStrength,
  validateNewPassword,
} from "@/lib/auth/credentials";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { markPasswordChanged } from "@/services/user.service";
import { useAuthStore } from "@/store/auth-store";

export function PasswordChangeModal() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);
  const validationError = password ? validateNewPassword(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ruleError = validateNewPassword(password);
    if (ruleError) {
      setError(ruleError);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser || !user) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(currentUser, password);
      await markPasswordChanged(user.id);
      setUser({ ...user, passwordChanged: true });
      toast({ title: "Password updated successfully.", variant: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-change-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <h2 id="password-change-title" className="text-lg font-semibold">
          Change your password
        </h2>
        <Text variant="muted" className="mt-1 text-sm">
          For security, you must set a new password before continuing.
        </Text>

        <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={validationError ?? undefined}
          />

          <div className="space-y-1">
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  strength.score <= 1 && "bg-destructive",
                  strength.score === 2 && "bg-warning",
                  strength.score === 3 && "bg-primary",
                  strength.score >= 4 && "bg-success",
                )}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <Text variant="caption" className="text-muted-foreground">
              Strength: {strength.label} (8+ chars, at least 1 number)
            </Text>
          </div>

          <FormField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!password || !confirm}
          >
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
