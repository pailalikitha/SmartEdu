"use client";

import { formatDate } from "@/lib/utils/format";

type DashboardGreetingProps = {
  name: string;
};

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  const today = formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const hour = new Date().getHours();
  const period =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = name.split(" ")[0] ?? name;

  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium text-primary sm:text-sm">{today}</p>
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl">
        {period}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here&apos;s your academic overview for today.
      </p>
    </div>
  );
}
