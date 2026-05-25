"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { getNavIcon } from "@/components/layout/nav-icons";
import type { NavItem } from "@/constants/navigation";
import { PROFILE_HREF_BY_ROLE } from "@/constants/navigation";
import type { UserRole } from "@/constants/roles";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: NavItem[];
  portalLabel: string;
  portalRoot: string;
  portalRole?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
};

function isNavItemActive(pathname: string, href: string, portalRoot: string) {
  if (pathname === href) return true;
  if (href === portalRoot) return false;
  return pathname.startsWith(`${href}/`);
}

export function Sidebar({
  items,
  portalLabel,
  portalRoot,
  portalRole,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const profileHref = portalRole
    ? PROFILE_HREF_BY_ROLE[portalRole]
    : items.find((i) => i.href.includes("/profile"))?.href ?? null;
  useLockBodyScroll(isOpen);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(80vw,280px)] max-w-[280px] flex-col border-r border-border bg-gradient-to-b from-secondary/40 to-background shadow-xl transition-transform duration-300 ease-out",
          "lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label={portalLabel}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Logo className="min-w-0" />
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="px-4 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
          {portalLabel}
        </p>

        <nav
          className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
          aria-label={`${portalLabel} navigation`}
        >
          {items.map((item) => {
            const isActive = isNavItemActive(pathname, item.href, portalRoot);
            const Icon = getNavIcon(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isActive ? (
                  <span
                    className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-warning"
                    aria-hidden
                  />
                ) : null}
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="safe-pb space-y-2 border-t border-border p-4">
          {profileHref ? (
            <Link
              href={profileHref}
              onClick={onClose}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname.includes("/profile") && "bg-muted text-foreground",
              )}
            >
              Profile
            </Link>
          ) : null}
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            SmartEdu AI · Academic intelligence
          </p>
        </div>
      </aside>
    </>
  );
}
