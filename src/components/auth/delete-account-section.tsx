"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslate } from "@/i18n/language-provider";
import { deleteAccount } from "@/app/settings/actions";

export function DeleteAccountSection() {
  const t = useTranslate();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("password", password);
      formData.set("confirm", confirm);

      const result = await deleteAccount(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      await signOut({ redirect: false });
      router.push("/login");
    } catch {
      setError(t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 border-t border-border-subtle pt-8">
      <h2 className="text-lg font-bold text-red-500">
        {t("settings.deleteAccount")}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        {t("settings.deleteWarning")}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-600 hover:text-white"
        >
          {t("settings.deleteButton")}
        </button>
      ) : (
        <form onSubmit={handleDelete} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {t("settings.confirmDeleteLabel")}
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full rounded-md border border-red-600/50 bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              required
              minLength={6}
              className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand placeholder:text-text-secondary/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || confirm !== "ELIMINAR"}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? t("settings.deleting") : t("settings.confirmDelete")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setPassword("");
                setError("");
              }}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t("reviews.cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
