"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { FirebaseConfigAlert } from "@/components/auth";
import { RoleSelector } from "@/features/auth/components/role-selector";
import { Button, FormField, Heading, Text } from "@/components/ui";
import { USER_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useRegister } from "@/features/auth/hooks/use-register";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";

export function RegisterForm() {
  const { register: signUp, error, isLoading } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      role: USER_ROLES.student,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch for controlled role cards
  const selectedRole = watch("role");

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <Heading level="h2" as="h1" className="text-xl">
          Create account
        </Heading>
        <Text variant="muted" as="p">
          Join SmartEdu AI — pick your role to get started
        </Text>
      </div>

      <FirebaseConfigAlert />

      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) =>
          signUp({
            email: values.email,
            password: values.password,
            displayName: values.displayName,
            role: values.role,
          }),
        )}
        noValidate
      >
        <FormField
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          description="Minimum 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <RoleSelector
          register={register}
          value={selectedRole}
          error={errors.role?.message}
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
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
