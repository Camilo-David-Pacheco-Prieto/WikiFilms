import type { ContentResult } from "@/types/tmdb";
import { ContentCard } from "./content-card";

interface ContentGridProps {
  items: ContentResult[];
  title?: string;
}

export function ContentGrid({ items, title }: ContentGridProps) {
  return (
    <section>
      {title && (
        <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((content) => (
          <ContentCard key={`${content.type}-${content.id}`} content={content} />
        ))}
      </div>
    </section>
  );
}