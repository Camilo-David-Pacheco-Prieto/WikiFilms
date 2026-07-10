"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
  name: string;
  role: string;
}

export function UserDropdown({ name, role }: UserDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md bg-surface px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        {name}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border-subtle bg-surface py-1 shadow-lg">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Favoritos
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Configuracion
            </Link>
            {role === "ADMIN" && (
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Admin
              </Link>
            )}
            <hr className="border-border-subtle" />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Cerrar sesion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
