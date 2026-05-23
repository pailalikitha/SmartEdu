import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const headingVariants = cva("font-heading tracking-tight text-foreground", {
  variants: {
    level: {
      h1: "text-4xl font-semibold sm:text-5xl",
      h2: "text-3xl font-semibold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-medium",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

export function Heading({
  className,
  level = "h2",
  as,
  ...props
}: HeadingProps) {
  const Tag = as ?? level ?? "h2";
  return (
    <Tag className={cn(headingVariants({ level }), className)} {...props} />
  );
}

const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-base leading-relaxed text-foreground",
      lead: "text-lg leading-relaxed text-muted-foreground",
      small: "text-sm leading-normal text-foreground",
      muted: "text-sm text-muted-foreground",
      label: "text-sm font-medium text-foreground",
      caption: "text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TextProps = HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof textVariants> & {
    as?: "p" | "span" | "div";
  };

export function Text({
  className,
  variant = "body",
  as: Tag = "p",
  ...props
}: TextProps) {
  return <Tag className={cn(textVariants({ variant }), className)} {...props} />;
}

export { headingVariants, textVariants };
