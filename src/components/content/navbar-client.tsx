"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

interface NavbarClientProps {
  user?: {
    name: string;
    role: string;
  } | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden rounded-md p-2 text-text-secondary hover:text-white transition-colors"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
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
        className={`fixed left-0 right-0 top-16 z-50 border-b border-border-subtle bg-base/95 backdrop-blur-xl transition-transform duration-300 md:static md:flex md:items-center md:gap-6 md:border-none md:bg-transparent md:backdrop-blur-none md:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:px-0 md:py-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white md:hover:bg-transparent"
          >
            Inicio
          </Link>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white md:hover:bg-transparent"
          >
            Explorar
          </Link>
          {user && (
            <>
              <hr className="border-border-subtle md:hidden" />
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white md:hover:bg-transparent"
              >
                Favoritos
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white md:hover:bg-transparent"
              >
                Mi lista
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-accent-brand transition-colors hover:bg-surface md:hover:bg-transparent"
                >
                  Admin
                </Link>
              )}
              <hr className="border-border-subtle" />
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-white md:hover:bg-transparent"
              >
                Cerrar sesion
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
