"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FirebaseConfigAlert } from "@/components/auth";
import { Button, FormField, Heading, Text } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import type { LoginRoleTab } from "@/constants/roles";
import { ROLE_LABELS, loginTabToUserRole } from "@/constants/roles";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";

const ROLE_TABS: LoginRoleTab[] = ["student", "teacher", "admin", "parent"];

export function LoginForm() {
  const { login, forgotPassword, error, resetSent, isLoading } = useLogin();
  const [showForgot, setShowForgot] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      roleTab: "student",
      rememberMe: true,
    },
  });

  const roleTab = watch("roleTab");

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
          <GraduationCap className="size-8" aria-hidden />
        </div>
        <Heading level="h2" as="h1" className="text-xl">
          SmartEdu
        </Heading>
        <Text variant="muted" as="p">
          Sign in to your school portal
        </Text>
      </div>

      <FirebaseConfigAlert />

      <div
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4"
        role="tablist"
        aria-label="Select role"
      >
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={roleTab === tab}
            onClick={() => setValue("roleTab", tab)}
            className={cn(
              "touch-target rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:text-sm",
              roleTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ROLE_LABELS[loginTabToUserRole(tab)]}
          </button>
        ))}
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          login({
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
            expectedRoleTab: values.roleTab,
          }),
        )}
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

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-primary"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setShowForgot((v) => !v)}
          >
            Forgot Password?
          </button>
        </div>

        {showForgot ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <Text variant="caption" as="p">
              Enter your email and we&apos;ll send a reset link.
            </Text>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={isLoading}
              onClick={() => {
                const email = watch("email");
                if (!email) {
                  return;
                }
                void forgotPassword(email);
              }}
            >
              Send reset email
            </Button>
            {resetSent ? (
              <Text variant="caption" as="p" className="text-success">
                Check your email
              </Text>
            ) : null}
          </div>
        ) : null}

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
          Login
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={ROUTES.resetPassword}
          className="font-medium text-primary hover:underline"
        >
          Reset password page
        </Link>
        {" · "}
        <Link
          href={ROUTES.register}
          className="font-medium text-primary hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
