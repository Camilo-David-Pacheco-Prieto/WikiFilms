import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["dashboard.title"] };
}

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

async function ProfileSection() {
  const session = await auth();
  const user = session!.user;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
      <h1 className="font-display text-3xl font-bold uppercase text-white">
        {dict["dashboard.profile"]}
      </h1>
      <div className="mt-8 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {dict["dashboard.name"]}
          </p>
          <p className="mt-1 text-lg text-white">{user.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {dict["dashboard.email"]}
          </p>
          <p className="mt-1 text-lg text-white">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {dict["dashboard.username"]}
          </p>
          <p className="mt-1 text-lg text-white">{user.username}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {dict["dashboard.role"]}
          </p>
          <p className="mt-1 text-lg text-white">{user.role}</p>
        </div>
      </div>
    </div>
  );
}

async function FavoritesList({ tab }: { tab: string }) {
  const session = await auth();
  const user = session!.user;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const isGamesTab = tab === "games";

  const allFavorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const favorites = allFavorites.filter((item) => isGamesTab ? item.type === "game" : item.type !== "game");

  function itemHref(item: { type: string; contentId: number }): string {
    if (item.type === "movie") return `/movie/${item.contentId}`;
    if (item.type === "tv") return `/tv/${item.contentId}`;
    return `/game/${item.contentId}`;
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold uppercase text-white">
        {dict["dashboard.favorites"]}
      </h2>

      <div className="mt-4 flex gap-2 border-b border-border-subtle">
        <Link
          href="/dashboard"
          data-active={!isGamesTab}
          className="px-4 py-2 text-sm font-medium transition-colors data-[active=true]:border-b-2 data-[active=true]:border-accent-brand data-[active=true]:text-accent-brand text-text-secondary hover:text-white"
        >
          {dict["watchlist.tabMovies"]}
        </Link>
        <Link
          href="/dashboard?tab=games"
          data-active={isGamesTab}
          className="px-4 py-2 text-sm font-medium transition-colors data-[active=true]:border-b-2 data-[active=true]:border-accent-brand data-[active=true]:text-accent-brand text-text-secondary hover:text-white"
        >
          {dict["watchlist.tabGames"]}
        </Link>
      </div>

      {favorites.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={itemHref(fav)}
              className="group relative overflow-hidden rounded-lg"
            >
              {fav.posterUrl ? (
                <div className="relative aspect-[2/3] w-full bg-surface">
                  <Image
                    src={fav.posterUrl}
                    alt={fav.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-surface text-sm text-text-secondary">
                  {dict["dashboard.noImage"]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-2 transition-transform md:translate-y-full md:group-hover:translate-y-0">
                <p className="font-display text-sm font-bold uppercase leading-tight text-white">
                  {fav.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-text-secondary">
          {dict["dashboard.noFavorites"]}
        </p>
      )}
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
      <div className="h-7 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tab } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-16">
      <Suspense fallback={null}>
        <ProfileSection />
      </Suspense>
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesList tab={tab ?? "movies"} />
      </Suspense>
    </main>
  );
}
