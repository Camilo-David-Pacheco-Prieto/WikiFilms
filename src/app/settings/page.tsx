import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsForm } from "@/components/auth/settings-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["auth.settingsTitle"] };
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          {dict["auth.settingsHeading"]}
        </h1>
        <SettingsForm user={{ id: session.user.id, name: session.user.name, email: session.user.email, username: (session.user as any).username, avatarUrl: (session.user as any).avatarUrl }} />
      </div>
    </main>
  );
}
