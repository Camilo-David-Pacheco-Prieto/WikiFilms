"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/i18n/language-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}
