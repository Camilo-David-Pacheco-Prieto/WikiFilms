import { LoginForm } from "@/components/auth/login-form";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["auth.loginTitle"] };
}

export default async function LoginPage() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm items-center px-4">
      <div className="w-full rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="mb-8 text-center font-display text-2xl font-bold uppercase text-white">
          {dict["auth.loginHeading"]}
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}