import { SkeletonCard } from "./skeleton-card";

interface SkeletonGridProps {
  title: string;
  count?: number;
}

export function SkeletonGrid({ title, count = 12 }: SkeletonGridProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold uppercase text-white">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
