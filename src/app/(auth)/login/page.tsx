import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — WikiFilms",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm items-center px-4">
      <div className="w-full rounded-lg border border-border-subtle bg-surface p-8">
        <h1 className="mb-8 text-center font-display text-2xl font-bold uppercase text-white">
          Iniciar sesión
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}