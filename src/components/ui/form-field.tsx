import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type FormFieldProps = ComponentProps<typeof Input> & {
  label?: string;
  description?: string;
  error?: string;
  wrapperClassName?: string;
};

export function FormField({
  label,
  description,
  error,
  id,
  className,
  wrapperClassName,
  ...props
}: FormFieldProps) {
  const fieldId =
    id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? props.name;

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {label ? (
        <Label htmlFor={fieldId} className="text-foreground">
          {label}
        </Label>
      ) : null}
      <Input
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn("h-10 bg-card", className)}
        {...props}
      />
      {description && !error ? (
        <Text variant="caption" as="span">
          {description}
        </Text>
      ) : null}
      {error ? (
        <Text variant="caption" as="span" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
