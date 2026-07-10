"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslate } from "@/i18n/language-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserDropdownProps {
  name: string;
  role: string;
}

export function UserDropdown({ name, role }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslate();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md transition-colors hover:bg-muted/50"
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-popover py-1 shadow-lg">
            <div className="border-b border-border px-4 py-2 text-sm font-medium text-foreground">
              {name}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t("userDropdown.favorites")}
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t("userDropdown.settings")}
            </Link>
            {role === "ADMIN" && (
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t("userDropdown.admin")}
              </Link>
            )}
            <hr className="border-border" />
            <button
              onClick={async () => {
                try {
                  await signOut({ callbackUrl: window.location.origin });
                } catch {
                  await signOut({ redirect: false });
                  window.location.href = window.location.origin;
                }
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t("userDropdown.signOut")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
