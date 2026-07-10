import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Mi perfil — WikiFilms",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const [favorites, watched, planToWatch] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.watchlistItem.findMany({
      where: { userId: user.id, status: "WATCHED" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.watchlistItem.findMany({
      where: { userId: user.id, status: "PLAN_TO_WATCH" },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  function renderGrid(
    items: { id: string; contentId: number; type: string; title: string; posterUrl: string | null }[],
    emptyMsg: string,
  ) {
    if (items.length === 0) {
      return <p className="mt-4 text-text-secondary">{emptyMsg}</p>;
    }
    return (
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.type === "movie" ? `/movie/${item.contentId}` : `/tv/${item.contentId}`}
            className="group relative overflow-hidden rounded-lg"
          >
            {item.posterUrl ? (
              <div className="relative aspect-[2/3] w-full bg-surface">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center bg-surface text-sm text-text-secondary">
                Sin imagen
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-2 transition-transform md:translate-y-full md:group-hover:translate-y-0">
              <p className="font-display text-sm font-bold uppercase leading-tight text-white">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-16">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Mi perfil
        </h1>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Nombre
            </p>
            <p className="mt-1 text-lg text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Correo
            </p>
            <p className="mt-1 text-lg text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Usuario
            </p>
            <p className="mt-1 text-lg text-white">{user.username}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Rol
            </p>
            <p className="mt-1 text-lg text-white">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold uppercase text-white">
          Mis favoritos
        </h2>
        {renderGrid(favorites, "No tienes favoritos aún.")}
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold uppercase text-white">
          Mi lista
        </h2>

        <div className="mt-4 space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-400">
              Vistas ({watched.length})
            </p>
            {renderGrid(watched, "No has marcado nada como visto.")}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-yellow-400">
              Por ver ({planToWatch.length})
            </p>
            {renderGrid(planToWatch, "No tienes nada pendiente.")}
          </div>
        </div>
      </div>
    </main>
  );
}
