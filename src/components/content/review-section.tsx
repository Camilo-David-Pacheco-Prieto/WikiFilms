"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslate, useLanguage } from "@/i18n/language-provider";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
  likes: number;
  dislikes: number;
  commentCount: number;
  myReaction: "LIKE" | "DISLIKE" | null;
}

interface ReviewComment {
  id: string;
  comment: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface ReviewSectionProps {
  contentId: number;
}

function CommentSection({ reviewId }: { reviewId: string }) {
  const { data: session } = useSession();
  const t = useTranslate();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}/comments`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setComments)
      .catch(() => setComments([]));
  }, [reviewId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > 500) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data]);
        setText("");
      } else {
        setError("Error al enviar comentario");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Error de conexión");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
      {comments.length === 0 ? (
        <p className="text-xs text-text-secondary/50">{t("reviews.noComments")}</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="rounded bg-base/50 px-3 py-2">
              <span className="text-xs font-medium text-white">{c.user.name}</span>
              <p className="text-xs text-text-secondary">{c.comment}</p>
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {session?.user && (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder={t("reviews.commentPlaceholder")}
            className="min-w-0 flex-1 rounded-md border border-border-subtle bg-base px-3 py-1.5 text-xs text-white outline-none transition-colors focus:border-accent-brand"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="shrink-0 rounded-md bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {t("reviews.commentButton")}
          </button>
        </form>
      )}
    </div>
  );
}

export function ReviewSection({ contentId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const t = useTranslate();
  const { locale } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [reacting, setReacting] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/reviews?contentId=${contentId}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: Review[]) => {
        setReviews(data);
        if (session?.user) {
          const mine = data.find(
            (r) => r.user.id === session.user.id,
          );
          if (mine) {
            setMyReview(mine);
            setRating(mine.rating);
            setComment(mine.comment ?? "");
          }
        }
      })
      .catch(() => setReviews([]));
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
            { ...data, user: { id: session?.user?.id ?? "", name: session?.user?.name ?? "" }, likes: 0, dislikes: 0, commentCount: 0, myReaction: null },
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

  async function toggleReaction(reviewId: string, type: "LIKE" | "DISLIKE", e: React.MouseEvent) {
    e.stopPropagation();
    if (!session?.user || reacting.has(reviewId)) return;
    setReacting((prev) => new Set(prev).add(reviewId));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id !== reviewId) return r;

            let { likes, dislikes, myReaction } = r;

            if (data.action === "removed") {
              if (type === "LIKE") likes--;
              else dislikes--;
              myReaction = null;
            } else if (data.action === "updated") {
              if (type === "LIKE") {
                likes++;
                dislikes--;
              } else {
                dislikes++;
                likes--;
              }
              myReaction = type;
            } else {
              if (type === "LIKE") likes++;
              else dislikes++;
              myReaction = type;
            }

            return { ...r, likes, dislikes, myReaction };
          }),
        );
      }
    } catch {
      // silent
    } finally {
      setReacting((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  }

  function toggleComments(reviewId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg border border-border-subtle bg-surface p-4 md:p-6">
        <h2 className="font-display text-lg font-bold uppercase text-white md:text-xl">
          {t("reviews.heading")}
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
              placeholder={t("reviews.placeholder")}
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
                  ? t("reviews.saveLoading")
                  : myReview
                    ? t("reviews.updateButton")
                    : t("reviews.publishButton")}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t("reviews.empty")}
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
                  {new Date(review.createdAt).toLocaleDateString(locale === "es" ? "es-CO" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                  <button
                    onClick={(e) => toggleReaction(review.id, "LIKE", e)}
                    disabled={!session?.user}
                    className={`flex items-center gap-1 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed ${
                      review.myReaction === "LIKE" ? "text-accent-brand" : ""
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{review.likes}</span>
                  </button>
                  <button
                    onClick={(e) => toggleReaction(review.id, "DISLIKE", e)}
                    disabled={!session?.user}
                    className={`flex items-center gap-1 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed ${
                      review.myReaction === "DISLIKE" ? "text-red-500" : ""
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>{review.dislikes}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(review.id)}
                    className={`flex items-center gap-1 transition-colors hover:text-white ${
                      expandedComments.has(review.id) ? "text-accent-brand" : ""
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{review.commentCount}</span>
                  </button>
                </div>

                {expandedComments.has(review.id) && (
                  <CommentSection reviewId={review.id} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
