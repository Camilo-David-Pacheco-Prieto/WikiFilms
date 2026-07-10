import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return { title: dict["notifications.pageTitle"] };
}

const iconMap: Record<string, string> = {
  LIKE: "👍",
  DISLIKE: "👎",
  COMMENT: "💬",
  REPLY: "💬",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "justo ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const dict = await getDictionary(locale);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const actorIds = [...new Set(notifications.map((n) => n.actorId))];
  const actors = actorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a.name]));

  const textKeyMap: Record<string, string> = {
    LIKE: dict["notifications.liked"],
    DISLIKE: dict["notifications.disliked"],
    COMMENT: dict["notifications.commented"],
    REPLY: dict["notifications.replied"],
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict["notFound.backHome"]}
      </Link>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          {dict["notifications.pageHeading"]}
        </h1>

        {notifications.length === 0 ? (
          <p className="mt-6 text-sm text-text-secondary">
            {dict["notifications.allCaughtUp"]}
          </p>
        ) : (
          <div className="mt-6 space-y-1">
            {notifications.map((n) => {
              const href = n.contentId && n.contentType
                ? `/${n.contentType}/${n.contentId}`
                : null;

              return (
                <Link
                  key={n.id}
                  href={href ?? "#"}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors hover:bg-base/50 ${
                    !n.read ? "bg-accent-brand/5" : ""
                  }`}
                >
                  <span className="text-lg">{iconMap[n.type] ?? "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {actorMap.get(n.actorId) ?? "Unknown"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {textKeyMap[n.type] ?? dict["notifications.commented"]}
                    </p>
                    <p className="text-xs text-text-secondary/50">
                      {timeAgo(n.createdAt.toISOString())}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent-brand" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
