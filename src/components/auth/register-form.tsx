"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslate } from "@/i18n/language-provider";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const username = form.get("username") as string;
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError(t("auth.serverError"));
      setLoading(false);
    }
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
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.namePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.emailPlaceholder")}
        />
      </div>

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
          minLength={3}
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
          minLength={6}
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.passwordMin")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
          placeholder={t("auth.confirmPasswordPlaceholder")}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent-brand px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? t("auth.registerLoading") : t("auth.registerButton")}
      </button>

      <p className="text-center text-sm text-text-secondary">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-accent-brand hover:underline"
        >
          {t("auth.loginLink")}
        </Link>
      </p>
    </form>
  );
}