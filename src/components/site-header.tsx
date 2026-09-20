"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/characters", label: "Characters" },
  { href: "/locations", label: "Locations" },
  { href: "/episodes", label: "Episodes" },
] as const;

interface NavLinksProps {
  onNavigate?: () => void;
  linkClassName?: string;
}

function NavLinks({ onNavigate, linkClassName = "" }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`text-body font-medium transition-colors ${
              isActive
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            } ${linkClassName}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-8 w-8 shrink-0 rounded-full bg-[conic-gradient(from_180deg,var(--color-brand),var(--color-accent),var(--color-brand))] p-0.5"
          >
            <span className="block h-full w-full rounded-full bg-background" />
          </span>
          <span className="text-heading leading-none font-bold text-foreground">
            Multiverse Explorer
          </span>
        </Link>

        <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary">
          <NavLinks />
        </nav>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="grid h-9 w-9 place-content-center rounded-control text-foreground-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:hidden"
        >
          {mobileOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="flex flex-col gap-1 border-t border-border bg-background p-3 sm:hidden"
        >
          <NavLinks
            onNavigate={() => setMobileOpen(false)}
            linkClassName="rounded-control px-3 py-2 hover:bg-surface-elevated"
          />
        </nav>
      )}
    </header>
  );
}
