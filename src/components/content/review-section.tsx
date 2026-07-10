"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

interface ReviewSectionProps {
  contentId: number;
}

export function ReviewSection({ contentId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?contentId=${contentId}`)
      .then((res) => res.json())
      .then((data: Review[]) => {
        setReviews(data);
        if (session?.user) {
          const mine = data.find(
            (r) => r.user.name === session.user.name,
          );
          if (mine) {
            setMyReview(mine);
            setRating(mine.rating);
            setComment(mine.comment ?? "");
          }
        }
      })
      .catch(() => {});
  }, [contentId, session]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 10) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, rating, comment: comment || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyReview(data);
        setReviews((prev) => {
          const filtered = prev.filter(
            (r) => r.user.name !== session?.user?.name,
          );
          return [
            { ...data, user: { name: session?.user?.name ?? "" } },
            ...filtered,
          ];
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg border border-border-subtle bg-surface p-4 md:p-6">
        <h2 className="font-display text-lg font-bold uppercase text-white md:text-xl">
          Reseñas
        </h2>

        {session?.user && (
          <form onSubmit={submitReview} className="mt-4 space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className={`text-lg transition-all hover:scale-110 ${
                    star <= (hoveredStar || rating)
                      ? "text-yellow-400"
                      : "text-zinc-600"
                  }`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-text-secondary">
                  {rating}/10
                </span>
              )}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Escribe tu reseña (opcional)"
              rows={3}
              className="w-full rounded-md border border-border-subtle bg-base px-4 py-2 text-sm text-white outline-none transition-colors focus:border-accent-brand focus:ring-1 focus:ring-accent-brand placeholder:text-text-secondary/50"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary/50">
                {comment.length}/500
              </span>
              <button
                type="submit"
                disabled={loading || rating < 1}
                className="rounded-md bg-accent-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {loading
                  ? "Guardando..."
                  : myReview
                    ? "Actualizar reseña"
                    : "Publicar reseña"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Aún no hay reseñas. Sé el primero en opinar.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-md bg-base p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {review.user.name}
                  </span>
                  <span className="text-sm text-yellow-400">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(10 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {review.comment}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-secondary/50">
                  {new Date(review.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
