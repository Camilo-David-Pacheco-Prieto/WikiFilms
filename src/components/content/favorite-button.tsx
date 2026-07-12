"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslate } from "@/i18n/language-provider";

interface FavoriteButtonProps {
  contentId: number;
  title: string;
  posterUrl: string | null;
  type: "movie" | "tv" | "game";
}

export function FavoriteButton({
  contentId,
  title,
  posterUrl,
  type,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const t = useTranslate();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/favorites/check?contentId=${contentId}&type=${type}`)
      .then((res) => res.json())
      .then((data: { favorited: boolean }) => {
        setFavorited(data.favorited);
      })
      .catch(() => {});
  }, [session, contentId, type]);

  async function toggle() {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, title, posterUrl, type }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      data-favorited={favorited}
      className="flex items-center gap-2 rounded-md border border-border-subtle px-4 py-2 text-sm font-medium transition-colors hover:border-yellow-400 data-[favorited=true]:border-yellow-400 data-[favorited=true]:bg-yellow-400/10 data-[favorited=true]:text-yellow-400 text-text-secondary disabled:opacity-50"
    >
      <Star
        className={`h-4 w-4 ${favorited ? "fill-yellow-400" : "text-yellow-400/50"}`}
      />
      {favorited ? t("favoriteButton.remove") : t("favoriteButton.add")}
    </button>
  );
}
