import { Suspense } from "react";
import { getPopularGames, getUpcomingGames, getTrendingGames } from "@/lib/igdb";
import { HeroSlider } from "@/components/content/hero-slider";
import { ContentGrid } from "@/components/content/content-grid";
import { SkeletonGrid } from "@/components/content/skeleton-grid";
import { SkeletonHero } from "@/components/content/skeleton-hero";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

async function HeroSection() {
  const trending = await getTrendingGames(6);
  return <HeroSlider items={trending} />;
}

async function PopularGames({ title }: { title: string }) {
  const games = await getPopularGames(12);
  return <ContentGrid title={title} items={games} />;
}

async function UpcomingGames({ title }: { title: string }) {
  const games = await getUpcomingGames(12);
  return <ContentGrid title={title} items={games} />;
}

export default async function GamesPage() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <Suspense fallback={<SkeletonHero />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<SkeletonGrid title={dict["games.popular"]} />}>
        <PopularGames title={dict["games.popular"]} />
      </Suspense>

      <Suspense fallback={<SkeletonGrid title={dict["games.upcoming"]} />}>
        <UpcomingGames title={dict["games.upcoming"]} />
      </Suspense>
    </main>
  );
}
