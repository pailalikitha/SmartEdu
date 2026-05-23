"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  useLockBodyScroll(open);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md safe-pt">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Logo showTagline className="min-w-0 shrink" />

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
          <Link href={ROUTES.login}>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="sm">Get started</Button>
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-card transition-all duration-200 md:hidden",
          open ? "visible max-h-48 opacity-100" : "invisible max-h-0 overflow-hidden opacity-0",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6"
          aria-label="Mobile main"
        >
          <Link href={ROUTES.login} onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full">
              Sign in
            </Button>
          </Link>
          <Link href={ROUTES.register} onClick={() => setOpen(false)}>
            <Button className="w-full">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
