"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FirebaseConfigAlert } from "@/components/auth";
import { Button, FormField, Heading, Text } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import { sendPasswordReset } from "@/services/auth.service";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError(null);
    setSuccess(false);

    if (!isFirebaseConfigured()) {
      setError(
        "Firebase is not configured. Add keys to .env.local (see .env.example).",
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(values.email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <Heading level="h2" as="h1" className="text-xl">
          Reset password
        </Heading>
        <Text variant="muted" as="p">
          We&apos;ll email you instructions to reset your password
        </Text>
      </div>

      <FirebaseConfigAlert />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          error={errors.email?.message}
          {...register("email")}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-sm text-success"
          >
            Check your email for reset instructions
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-10 w-full"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
