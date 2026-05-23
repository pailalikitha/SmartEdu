import Link from "next/link";
import { GraduationCap, LineChart, Sparkles } from "lucide-react";

import { Logo } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: GraduationCap,
    title: "Student insights",
    description: "Weak topics, study plans, and exam readiness.",
  },
  {
    icon: LineChart,
    title: "Teacher analytics",
    description: "Class performance and AI-assisted lesson planning.",
  },
  {
    icon: Sparkles,
    title: "School leadership",
    description: "Interventions and school-wide academic KPIs.",
  },
] as const;

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-background lg:flex-row">
      <aside
        className={cn(
          "relative hidden min-h-dvh overflow-hidden lg:flex lg:w-[min(42%,28rem)] lg:flex-col lg:justify-between",
          "bg-gradient-to-br from-secondary via-background to-accent/60",
        )}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-56 rounded-full bg-accent/80 blur-2xl" />

        <div className="relative z-10 p-8 xl:p-10">
          <Logo showTagline />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI-powered academic intelligence for students, teachers, and school
            leaders across India.
          </p>
        </div>

        <ul className="relative z-10 space-y-4 p-8 pt-0 xl:p-10">
          {highlights.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-white/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-6 w-full max-w-md lg:hidden">
          <Logo showTagline />
        </div>

        <div
          className={cn(
            "w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-md sm:p-8",
            className,
          )}
        >
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={ROUTES.home}
            className="font-medium text-primary hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
