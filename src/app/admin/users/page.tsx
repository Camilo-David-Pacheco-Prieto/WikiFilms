import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsers } from "./actions";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["admin.title"] };
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const users = await getUsers();
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase text-white">
        {dict["admin.heading"]}
      </h1>

      <div className="mt-8 space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{user.name}</p>
              <p className="text-sm text-text-secondary truncate">
                {user.username} · {user.email}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                data-admin={user.role === "ADMIN"}
                className="rounded-md bg-accent-brand/10 px-2.5 py-0.5 text-xs font-medium text-accent-brand data-[admin=true]:bg-accent-brand data-[admin=true]:text-white"
              >
                {user.role}
              </span>
              <p className="text-xs text-text-secondary whitespace-nowrap">
                {new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}