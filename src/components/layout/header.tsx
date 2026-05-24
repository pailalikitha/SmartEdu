"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Search, X } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button, Input } from "@/components/ui";
import { getRoleHomePath } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type HeaderProps = {
  title?: string;
  onMenuClick?: () => void;
};

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initials =
    user?.displayName?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "?";

  const profileHref =
    user?.role === "student"
      ? ROUTES.student.profile
      : user?.role === "teacher"
        ? ROUTES.teacher.profile
        : user?.role === "parent"
          ? ROUTES.parent.profile
          : getRoleHomePath(user?.role ?? "student");

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  return (
    <header className="safe-pt sticky top-0 z-30 shrink-0 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 touch-target lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <Logo className="min-w-0 shrink lg:hidden" />

        <h1 className="hidden min-w-0 flex-1 truncate font-heading text-sm font-semibold text-foreground sm:text-base lg:block lg:max-w-[12rem] xl:max-w-xs">
          {title}
        </h1>

        <div className="relative hidden min-w-0 flex-1 md:flex lg:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-full bg-muted/60 pl-9"
            aria-label="Search dashboard"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="touch-target md:hidden"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? (
              <X className="size-5" />
            ) : (
              <Search className="size-5" />
            )}
          </Button>

          <NotificationBell />

          {user ? (
            <>
              <Link
                href={profileHref}
                className="hidden items-center gap-2 rounded-full border border-border bg-muted/30 py-1 pr-3 pl-1 transition-colors hover:bg-muted lg:flex"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                )}
                <span className="max-w-[7rem] truncate text-sm text-foreground xl:max-w-[10rem]">
                  {user.displayName ?? user.email}
                </span>
              </Link>
              <Link
                href={profileHref}
                className="touch-target flex size-10 items-center justify-center rounded-full border border-border sm:size-11 lg:hidden"
                aria-label="Profile"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-primary">
                    {initials}
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                isLoading={isLoggingOut}
                className="hidden lg:inline-flex"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden xl:inline">Sign out</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-card px-3 transition-[max-height,opacity] duration-200 md:hidden",
          searchOpen ? "max-h-16 opacity-100" : "max-h-0 border-t-0 opacity-0",
        )}
      >
        <div className="relative py-2">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search..."
            className="h-12 w-full bg-muted/60 pl-9"
            aria-label="Search dashboard"
          />
        </div>
      </div>
    </header>
  );
}
