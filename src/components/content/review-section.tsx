"use client";

import { useState, useEffect, useRef } from "react";
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
  parentId: string | null;
  parentUser: string | null;
}

interface CommentNode extends ReviewComment {
  children: CommentNode[];
  depth: number;
}

interface ReviewSectionProps {
  contentId: number;
  contentType: "movie" | "tv";
}

function CommentSection({ reviewId, contentType }: { reviewId: string; contentType: string }) {
  const { data: session } = useSession();
  const t = useTranslate();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}/comments`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: ReviewComment[]) => {
        setComments(data);
        const map = new Map<string, { children: number; depth: number }>();
        data.forEach((c) => map.set(c.id, { children: 0, depth: 0 }));
        data.forEach((c) => {
          if (c.parentId && map.has(c.parentId)) {
            const child = map.get(c.id)!;
            child.depth = map.get(c.parentId)!.depth + 1;
            map.get(c.parentId)!.children++;
          }
        });
        const initial = new Set<string>();
        map.forEach((node, id) => {
          if (node.depth >= 2 && node.children > 0) initial.add(id);
        });
        setCollapsed(initial);
      })
      .catch(() => setComments([]));
  }, [reviewId]);

  function buildTree(): CommentNode[] {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    comments.forEach((c) => {
      map.set(c.id, { ...c, children: [], depth: 0 });
    });

    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        node.depth = map.get(c.parentId)!.depth + 1;
        map.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > 500) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text.trim(), contentType, parentId: replyingTo || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        data.parentUser = null;
        setComments((prev) => [...prev, data]);
        setText("");
        setReplyingTo(null);
      } else {
        setError("Error al enviar comentario");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Error de conexion");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  function startReply(commentId: string) {
    setReplyingTo(commentId);
    setText("");
    setTimeout(() => replyInputRef.current?.focus(), 100);
  }

  function cancelReply() {
    setReplyingTo(null);
    setText("");
  }

  function toggleReplies(commentId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  function renderComment(node: CommentNode): React.ReactNode {
    const childrenCollapsed = collapsed.has(node.id);
    const showReplyForm = replyingTo === node.id;

    return (
      <div key={node.id} className={node.depth > 0 ? "ml-6 border-l border-border-subtle pl-4" : ""}>
        <div className="rounded bg-base/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white">{node.user.name}</span>
            {node.parentUser && (
              <span className="text-xs text-text-secondary/60">
                {t("reviews.repliedTo").replace("{name}", node.parentUser)}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">{node.comment}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[10px] text-text-secondary/40">
              {new Date(node.createdAt).toLocaleDateString("es-CO", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </span>
            {session?.user && (
              <button
                onClick={() => startReply(node.id)}
                className="text-[10px] text-accent-brand transition-colors hover:text-accent-hover"
              >
                {t("reviews.reply")}
              </button>
            )}
          </div>
        </div>

        {showReplyForm && (
          <div className={node.depth > 0 ? "ml-6 mt-2" : "mt-2"}>
            <form onSubmit={submit} className="flex gap-2">
              <input
                ref={replyInputRef}
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
              <button
                type="button"
                onClick={cancelReply}
                className="shrink-0 rounded-md border border-border-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-white"
              >
                {t("reviews.cancel")}
              </button>
            </form>
          </div>
        )}

        {node.children.length > 0 && (
          <>
            {childrenCollapsed ? (
              <button
                onClick={() => toggleReplies(node.id)}
                className="ml-6 mt-1 text-[10px] text-accent-brand transition-colors hover:text-accent-hover"
              >
                {t("reviews.viewMore").replace("{n}", String(node.children.length))}
              </button>
            ) : (
              <>
                {node.children.map(renderComment)}
                {node.depth >= 2 && (
                  <button
                    onClick={() => toggleReplies(node.id)}
                    className="ml-6 mt-1 text-[10px] text-text-secondary transition-colors hover:text-white"
                  >
                    {t("reviews.hideReplies")}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  const tree = buildTree();

  return (
    <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
      {tree.length === 0 ? (
        <p className="text-xs text-text-secondary/50">{t("reviews.noComments")}</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {tree.map(renderComment)}
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {session?.user && !replyingTo && (
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

export function ReviewSection({ contentId, contentType }: ReviewSectionProps) {
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
        body: JSON.stringify({ type, contentType }),
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
                  <CommentSection reviewId={review.id} contentType={contentType} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
