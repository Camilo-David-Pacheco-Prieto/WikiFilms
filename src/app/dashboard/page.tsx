import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mi perfil — WikiFilms",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-border-subtle bg-surface p-8">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Mi perfil
        </h1>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Nombre
            </p>
            <p className="mt-1 text-lg text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Correo
            </p>
            <p className="mt-1 text-lg text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Usuario
            </p>
            <p className="mt-1 text-lg text-white">{user.username}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Rol
            </p>
            <p className="mt-1 text-lg text-white">{user.role}</p>
          </div>
        </div>
      </div>
    </main>
  );
}