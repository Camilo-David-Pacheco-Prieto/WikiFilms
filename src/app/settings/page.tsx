import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsForm } from "@/components/auth/settings-form";

export const metadata: Metadata = {
  title: "Configuración — WikiFilms",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Configuración
        </h1>
        <SettingsForm user={session.user as { id: string; name: string; email: string; username: string }} />
      </div>
    </main>
  );
}
