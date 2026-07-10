"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslate } from "@/i18n/language-provider";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("auth.loginError"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.username")}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.usernamePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.passwordPlaceholder")}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent-brand px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? t("auth.loginLoading") : t("auth.loginButton")}
      </button>

      <p className="text-center text-sm text-text-secondary">
        {t("auth.noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-accent-brand hover:underline"
        >
          {t("auth.registerLink")}
        </Link>
      </p>
    </form>
  );
}