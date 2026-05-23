"use client";

import { GraduationCap, Heart, School, Users } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";

import { Label } from "@/components/ui";
import { ROLE_LABELS, USER_ROLES } from "@/constants/roles";
import type { UserRole } from "@/constants/roles";
import { cn } from "@/lib/utils";

import type { RegisterFormValues } from "@/features/auth/schemas/auth.schema";

const ROLE_OPTIONS: {
  value: UserRole;
  icon: typeof GraduationCap;
}[] = [
  { value: USER_ROLES.student, icon: GraduationCap },
  { value: USER_ROLES.teacher, icon: Users },
  { value: USER_ROLES.admin, icon: School },
  { value: USER_ROLES.parent, icon: Heart },
];

type RoleSelectorProps = {
  register: UseFormRegister<RegisterFormValues>;
  value: UserRole;
  error?: string;
};

export function RoleSelector({ register, value, error }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>I am a</Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_OPTIONS.map(({ value: roleValue, icon: Icon }) => {
          const selected = value === roleValue;
          return (
            <label
              key={roleValue}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors",
                selected
                  ? "border-primary bg-secondary/80 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
                error && !selected && "border-destructive/50",
              )}
            >
              <input
                type="radio"
                value={roleValue}
                className="sr-only"
                {...register("role")}
              />
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-xs font-medium text-foreground">
                {ROLE_LABELS[roleValue]}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
