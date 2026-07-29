import Link from "next/link";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <>
      <div className="sticky top-16 z-40 border-b border-border-subtle bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link
            href="/admin"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            {dict["admin.statsTab"]}
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            {dict["admin.usersTab"]}
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
