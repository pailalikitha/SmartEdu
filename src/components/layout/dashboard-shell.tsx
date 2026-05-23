"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/constants/navigation";

type DashboardShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  portalLabel: string;
  portalRoot: string;
  title?: string;
};

function resolvePageTitle(pathname: string, navItems: NavItem[]): string {
  const match = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
  );
  return match?.label ?? "Dashboard";
}

export function DashboardShell({
  children,
  navItems,
  portalLabel,
  portalRoot,
  title,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = title ?? resolvePageTitle(pathname, navItems);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="flex min-h-dvh min-w-0 bg-background">
      <Sidebar
        items={navItems}
        portalLabel={portalLabel}
        portalRoot={portalRoot}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Header
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="safe-pb flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="mx-auto min-w-0 w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
