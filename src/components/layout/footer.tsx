import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
