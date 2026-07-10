import type { Metadata } from "next";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { Clock, Users, BookOpen, Megaphone } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["comingSoon.title"] };
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 transition-colors hover:border-accent-brand/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent-brand/10 text-accent-brand">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-lg font-bold uppercase text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  );
}

export default async function ComingSoonPage() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: dict["comingSoon.actors"],
      description: dict["comingSoon.actorsDesc"],
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: dict["comingSoon.books"],
      description: dict["comingSoon.booksDesc"],
    },
    {
      icon: <Megaphone className="h-6 w-6" />,
      title: dict["comingSoon.announcements"],
      description: dict["comingSoon.announcementsDesc"],
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-brand/10">
            <Clock className="h-8 w-8 text-accent-brand" />
          </div>
        </div>
        <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
          {dict["comingSoon.heading"]}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-secondary">
          {dict["comingSoon.description"]}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </div>
    </main>
  );
}
