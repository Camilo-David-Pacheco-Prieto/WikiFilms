import Link from "next/link";
import type { ContentResult } from "@/types/tmdb";
import { ContentCard } from "./content-card";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

interface ContentGridProps {
  items: ContentResult[];
  title?: string;
  href?: string;
}

export async function ContentGrid({ items, title, href }: ContentGridProps) {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <section>
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {title}
          </h2>
          {href && (
            <Link
              href={href}
              className="text-sm font-medium text-accent-brand transition-colors hover:underline"
            >
              {dict["content.viewAll"]}
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((content) => (
          <ContentCard key={`${content.type}-${content.id}`} content={content} />
        ))}
      </div>
    </section>
  );
}