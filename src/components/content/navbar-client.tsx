"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";

interface NavbarClientProps {
  user?: {
    name: string;
    role: string;
  } | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslate();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden rounded-md p-2 text-text-secondary hover:text-white transition-colors"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={`fixed left-0 right-0 top-16 z-50 border-b border-border-subtle bg-base/95 backdrop-blur-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
          >
            {t("nav.explore")}
          </Link>
          {user && (
            <>
              <Link
                href="/watchlist"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
              >
                {t("nav.watchlist")}
              </Link>
              <Link
                href="/coming-soon"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
              >
                {t("nav.comingSoon")}
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
              >
                {t("userDropdown.favorites")}
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white"
              >
                {t("userDropdown.settings")}
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-accent-brand transition-colors hover:bg-surface"
                >
                  {t("nav.admin")}
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </>
  );
}
