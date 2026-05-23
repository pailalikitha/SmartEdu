import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showTagline?: boolean;
};

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <Link
      href={ROUTES.home}
      className={cn("inline-flex min-w-0 max-w-full flex-col", className)}
    >
      <span className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
        Smart<span className="text-brand-blue">Edu</span>
      </span>
      {showTagline ? (
        <span className="truncate text-xs text-muted-foreground">
          Academic intelligence
        </span>
      ) : null}
    </Link>
  );
}
