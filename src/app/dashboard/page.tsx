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
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

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

        {favorites.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {favorites.map((fav) => (
              <Link
                key={fav.id}
                href={fav.type === "movie" ? `/movie/${fav.contentId}` : `/tv/${fav.contentId}`}
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
                    Sin imagen
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100" />
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
            No tienes favoritos aun. Explora peliculas y series y agregalas a tu lista.
          </p>
        )}
      </div>
    </main>
  );
}
