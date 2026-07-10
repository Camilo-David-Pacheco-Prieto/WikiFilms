import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsers, updateUser, deleteUser } from "./actions";
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

      <div className="mt-8 space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border border-border-subtle bg-surface px-6 py-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{user.name}</p>
                <p className="truncate text-sm text-text-secondary">
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
                <p className="whitespace-nowrap text-xs text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "es-ES")}
                </p>
              </div>
            </div>

            <details className="group mt-3">
              <summary className="cursor-pointer text-sm font-medium text-accent-brand hover:text-accent-hover">
                {dict["admin.editUser"]}
              </summary>
              <form action={updateUser} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="id" value={user.id} />
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">{dict["auth.name"]}</label>
                  <input
                    name="name"
                    defaultValue={user.name}
                    required
                    className="w-full rounded-md border border-border-subtle bg-base px-3 py-2 text-sm text-white outline-none focus:border-accent-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">{dict["auth.email"]}</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    className="w-full rounded-md border border-border-subtle bg-base px-3 py-2 text-sm text-white outline-none focus:border-accent-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">{dict["auth.username"]}</label>
                  <input
                    name="username"
                    defaultValue={user.username}
                    required
                    className="w-full rounded-md border border-border-subtle bg-base px-3 py-2 text-sm text-white outline-none focus:border-accent-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">{dict["auth.password"]}</label>
                  <input
                    name="password"
                    type="password"
                    placeholder={dict["admin.passwordPlaceholder"]}
                    className="w-full rounded-md border border-border-subtle bg-base px-3 py-2 text-sm text-white outline-none focus:border-accent-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">{dict["admin.role"]}</label>
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="w-full rounded-md border border-border-subtle bg-base px-3 py-2 text-sm text-white outline-none focus:border-accent-brand"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-accent-brand px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                  >
                    {dict["admin.save"]}
                  </button>
                  <form action={deleteUser.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-600 hover:text-white"
                    >
                      {dict["admin.delete"]}
                    </button>
                  </form>
                </div>
              </form>
            </details>
          </div>
        ))}
      </div>
    </main>
  );
}