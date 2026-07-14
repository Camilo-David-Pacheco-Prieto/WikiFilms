"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslate } from "@/i18n/language-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const t = useTranslate();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null);

  const initials = (user.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar 2MB");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setAvatarUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAvatarUrl(data.avatarUrl);
      setSuccess(t("auth.savedSuccess"));
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch {
      setError("Error al subir la imagen");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(t("auth.savedSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch {
      setError(t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
          {success}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <label className="group relative cursor-pointer">
          <Avatar className="size-24">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
            ) : (
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            )}
          </Avatar>
          {avatarUploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/50">
              <Camera className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={avatarUploading}
            className="hidden"
          />
        </label>
        <div className="flex flex-col items-center gap-1 sm:items-start sm:pt-2">
          <p className="text-sm font-medium text-text-primary">Foto de perfil</p>
          <p className="text-xs text-text-secondary/50">
            PNG o JPG. Máximo 2MB.
          </p>
        </div>
      </div>

      <hr className="border-border-subtle" />

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.name")}
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
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
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
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
          type="text"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand"
        />
      </div>

      <hr className="border-border-subtle" />

      <div className="space-y-2">
        <label
          htmlFor="currentPassword"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.currentPassword")}
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder={t("auth.currentPasswordPlaceholder")}
          className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand placeholder:text-text-secondary/50"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {t("auth.newPassword")}
        </label>
        <input
          id="newPassword"
          type="password"
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("auth.newPasswordPlaceholder")}
          className="w-full rounded-md border border-border-subtle bg-base px-4 py-2.5 text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand placeholder:text-text-secondary/50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent-brand px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? t("auth.saveLoading") : t("auth.saveButton")}
      </button>
    </form>
  );
}
