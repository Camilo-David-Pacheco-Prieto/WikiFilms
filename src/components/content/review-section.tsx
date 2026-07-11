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
  editedAt: string | null;
  deletedAt: string | null;
  user: { id: string; name: string };
  parentId: string | null;
  parentUser: string | null;
  likes: number;
  dislikes: number;
  myReaction: "LIKE" | "DISLIKE" | null;
}

interface CommentNode extends ReviewComment {
  children: CommentNode[];
  depth: number;
}

interface ReviewSectionProps {
  contentId: number;
  contentType: "movie" | "tv";
}

type SortBy = "new" | "old" | "top";

function CommentSection({ reviewId, contentType }: { reviewId: string; contentType: string }) {
  const { data: session } = useSession();
  const t = useTranslate();
  const { locale } = useLanguage();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("new");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reacting, setReacting] = useState<Set<string>>(new Set());
  const replyInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}/comments?sort=${sortBy}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: ReviewComment[]) => {
        setComments(data);
        const depths = new Map<string, number>();
        data.forEach((c) => depths.set(c.id, 0));
        data.forEach((c) => {
          if (c.parentId && depths.has(c.parentId)) {
            depths.set(c.id, (depths.get(c.parentId) || 0) + 1);
          }
        });
        const childrenCount = new Map<string, number>();
        data.forEach((c) => {
          if (c.parentId) {
            childrenCount.set(c.parentId, (childrenCount.get(c.parentId) || 0) + 1);
          }
        });
        const initial = new Set<string>();
        depths.forEach((depth, id) => {
          if (depth >= 2 && (childrenCount.get(id) || 0) > 0) initial.add(id);
        });
        setCollapsed(initial);
      })
      .catch(() => setComments([]));
  }, [reviewId, sortBy]);

  function dateStr(d: string | null | undefined, showTime = false): string {
    if (!d) return "";
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric", month: "short", day: "numeric",
    };
    if (showTime) { opts.hour = "2-digit"; opts.minute = "2-digit"; }
    return new Date(d).toLocaleDateString(locale === "es" ? "es-CO" : "en-US", opts);
  }

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

    const sortTop = (a: CommentNode, b: CommentNode) =>
      (b.likes - b.dislikes) - (a.likes - a.dislikes);

    if (sortBy === "top") {
      roots.sort(sortTop);
      roots.forEach(function sortChildren(n: CommentNode) {
        n.children.sort(sortTop);
        n.children.forEach(sortChildren);
      });
    }

    return roots;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > 2000) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text.trim(), contentType, parentId: replyingTo || undefined }),
      });
      if (res.ok) {
        const data: ReviewComment = await res.json();
        data.parentUser = null;
        data.likes = 0; data.dislikes = 0; data.myReaction = null;
        data.editedAt = null; data.deletedAt = null;
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
    setEditingId(null);
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

  function startEdit(node: CommentNode) {
    setEditingId(node.id);
    setEditText(node.comment);
    setReplyingTo(null);
    setTimeout(() => editInputRef.current?.focus(), 100);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function submitEdit(commentId: string) {
    if (!editText.trim() || editText.length > 2000) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: editText.trim() }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => c.id === commentId ? { ...c, comment: editText.trim(), editedAt: new Date().toISOString() } : c),
        );
        setEditingId(null);
        setEditText("");
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function confirmDelete(commentId: string) {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => {
          const deleted = prev.find((c) => c.id === commentId);
          if (!deleted) return prev;
          // If soft delete, update local; if hard delete, remove from list
          if (deleted.deletedAt) {
            return prev.filter((c) => c.id !== commentId);
          }
          return prev.map((c) =>
            c.id === commentId ? { ...c, deletedAt: new Date().toISOString(), comment: "[eliminado]" } : c,
          );
        });
        setDeletingId(null);
      }
    } catch {}
  }

  async function toggleCommentReaction(commentId: string, type: "LIKE" | "DISLIKE") {
    if (!session?.user || reacting.has(commentId)) return;
    setReacting((prev) => new Set(prev).add(commentId));

    const snapshot = comments.find((c) => c.id === commentId);
    if (!snapshot) { setReacting((p) => { const n = new Set(p); n.delete(commentId); return n; }); return; }

    const optimistic = (c: ReviewComment): ReviewComment => {
      if (c.id !== commentId) return c;
      let { likes, dislikes, myReaction } = c;
      if (myReaction === type) {
        if (type === "LIKE") likes = Math.max(0, likes - 1);
        else dislikes = Math.max(0, dislikes - 1);
        myReaction = null;
      } else {
        if (myReaction === "LIKE") { likes = Math.max(0, likes - 1); dislikes++; }
        else if (myReaction === "DISLIKE") { dislikes = Math.max(0, dislikes - 1); likes++; }
        else { if (type === "LIKE") likes++; else dislikes++; }
        myReaction = type;
      }
      return { ...c, likes, dislikes, myReaction };
    };

    setComments((prev) => prev.map(optimistic));

    const revert = () => setComments((prev) => prev.map((c) => (c.id === commentId ? { ...snapshot } : c)));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) revert();
    } catch {
      revert();
    } finally {
      setReacting((p) => { const n = new Set(p); n.delete(commentId); return n; });
    }
  }

  function renderComment(node: CommentNode): React.ReactNode {
    const childrenCollapsed = collapsed.has(node.id);
    const showReplyForm = replyingTo === node.id;
    const isEditing = editingId === node.id;
    const isDeleting = deletingId === node.id;
    const isDeleted = !!node.deletedAt;
    const isOwner = session?.user?.id === node.user.id;
    const depthClass = node.depth > 0 ? "ml-6 border-l border-border-subtle pl-4" : "";

    if (isDeleted) {
      return (
        <div key={node.id} className={depthClass}>
          <div className="rounded bg-base/30 px-3 py-2 opacity-60">
            <p className="text-xs italic text-text-secondary/50">{t("reviews.deleted")}</p>
          </div>
          {node.children.length > 0 && (
            <div className="mt-1 space-y-1">{node.children.map(renderComment)}</div>
          )}
        </div>
      );
    }

    return (
      <div key={node.id} className={depthClass}>
        <div className="rounded bg-base/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white">{node.user.name}</span>
            {node.parentUser && (
              <span className="text-xs text-text-secondary/60">
                {t("reviews.repliedTo").replace("{name}", node.parentUser)}
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-1">
              <input
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={2000}
                className="w-full rounded-md border border-border-subtle bg-base px-3 py-1.5 text-xs text-white outline-none transition-colors focus:border-accent-brand"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => submitEdit(node.id)}
                  disabled={loading || !editText.trim()}
                  className="rounded bg-accent-brand px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {t("reviews.save")}
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded border border-border-subtle px-2 py-0.5 text-[10px] text-text-secondary transition-colors hover:text-white"
                >
                  {t("reviews.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-text-secondary">{node.comment}</p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <span className="text-[10px] text-text-secondary/40">
              {dateStr(node.createdAt)}
              {node.editedAt && (
                <span className="text-text-secondary/30"> · {t("reviews.edited")}</span>
              )}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-[10px] text-text-secondary">
            <button
              onClick={() => toggleCommentReaction(node.id, "LIKE")}
              disabled={!session?.user}
              className={`flex items-center gap-0.5 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed ${node.myReaction === "LIKE" ? "text-accent-brand" : ""}`}
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{node.likes}</span>
            </button>
            <button
              onClick={() => toggleCommentReaction(node.id, "DISLIKE")}
              disabled={!session?.user}
              className={`flex items-center gap-0.5 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed ${node.myReaction === "DISLIKE" ? "text-red-500" : ""}`}
            >
              <ThumbsDown className="h-3 w-3" />
              <span>{node.dislikes}</span>
            </button>
            {session?.user && (
              <button
                onClick={() => startReply(node.id)}
                className="transition-colors hover:text-white"
              >
                {t("reviews.reply")}
              </button>
            )}
            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => startEdit(node)}
                  className="transition-colors hover:text-white"
                >
                  {t("reviews.edit")}
                </button>
                {isDeleting ? (
                  <span className="flex items-center gap-1">
                    <span className="text-text-secondary/50">{t("reviews.deleteConfirm")}</span>
                    <button onClick={() => confirmDelete(node.id)} className="text-red-500 transition-colors hover:text-red-400">{t("reviews.deleteYes")}</button>
                    <button onClick={() => setDeletingId(null)} className="transition-colors hover:text-white">{t("reviews.deleteNo")}</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setDeletingId(node.id)}
                    className="text-red-500/60 transition-colors hover:text-red-500"
                  >
                    {t("reviews.delete")}
                  </button>
                )}
              </>
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
                maxLength={2000}
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

  const sortTabs: { key: SortBy; label: string }[] = [
    { key: "new", label: t("reviews.sortNew") },
    { key: "old", label: t("reviews.sortOld") },
    { key: "top", label: t("reviews.sortTop") },
  ];

  const tree = buildTree();

  return (
    <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
      {tree.length > 0 && (
        <div className="flex gap-2 pb-1">
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSortBy(tab.key)}
              className={`text-[11px] font-medium transition-colors hover:text-white ${
                sortBy === tab.key ? "text-accent-brand" : "text-text-secondary/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {tree.length === 0 ? (
        <p className="text-xs text-text-secondary/50">{t("reviews.noComments")}</p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
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
            maxLength={2000}
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

  const [highlightId, setHighlightId] = useState<string | null>(null);

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

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#review-")) return;
    const id = hash.replace("#review-", "");
    setHighlightId(id);
    const el = document.getElementById(`review-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        el.classList.add("ring-2", "ring-accent-brand", "ring-offset-2", "ring-offset-surface");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-accent-brand", "ring-offset-2", "ring-offset-surface");
          setHighlightId(null);
        }, 2000);
      }, 500);
    }
  }, []);

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
                id={"review-" + review.id}
                className={"rounded-md bg-base p-4 transition-shadow " + (highlightId === review.id ? "ring-2 ring-accent-brand ring-offset-2 ring-offset-surface" : "")}
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
