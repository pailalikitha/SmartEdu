"use client";

import Link from "next/link";
import { LogOut, Menu, Search } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button, Input } from "@/components/ui";
import { getRoleHomePath } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  title?: string;
  onMenuClick?: () => void;
};

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();

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

  return (
    <header className="safe-pt sticky top-0 z-30 shrink-0 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
      <div className="flex h-14 flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2 sm:h-16 sm:gap-x-3 sm:px-4 md:px-6 lg:flex-nowrap lg:py-0">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-foreground sm:text-base lg:max-w-[12rem] lg:flex-none xl:max-w-xs">
          {title}
        </h1>

        <div className="relative order-last hidden min-w-0 flex-1 md:order-none md:flex lg:max-w-md">
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

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
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
                className="flex size-9 items-center justify-center rounded-full border border-border lg:hidden"
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
                className="hidden sm:inline-flex"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden md:inline">Sign out</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                isLoading={isLoggingOut}
                className="sm:hidden"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
