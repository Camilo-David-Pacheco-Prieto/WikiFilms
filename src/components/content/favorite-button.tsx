"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  contentId: number;
  title: string;
  posterUrl: string | null;
  type: "movie" | "tv";
}

export function FavoriteButton({
  contentId,
  title,
  posterUrl,
  type,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data: { contentId: number }[]) => {
        setFavorited(data.some((f) => f.contentId === contentId));
      })
      .catch(() => {});
  }, [session, contentId]);

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
      className="flex items-center gap-2 rounded-md border border-border-subtle px-4 py-2 text-sm font-medium transition-colors hover:border-accent-brand data-[favorited=true]:border-accent-brand data-[favorited=true]:bg-accent-brand/10 data-[favorited=true]:text-accent-brand text-text-secondary disabled:opacity-50"
    >
      <Heart
        className={`h-4 w-4 ${favorited ? "fill-accent-brand" : ""}`}
      />
      {favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    </button>
  );
}
