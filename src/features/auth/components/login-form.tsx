"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { FirebaseConfigAlert } from "@/components/auth";
import { Button, FormField, Heading, Text } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth.schema";

export function LoginForm() {
  const { login, error, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <Heading level="h2" as="h1" className="text-xl">
          Welcome back
        </Heading>
        <Text variant="muted" as="p">
          Sign in to your SmartEdu account
        </Text>
      </div>

      <FirebaseConfigAlert />

      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => login(values))}
        noValidate
      >
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
          >
            <Text variant="caption" as="p" className="text-destructive">
              {error}
            </Text>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-10 w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={ROUTES.register}
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
