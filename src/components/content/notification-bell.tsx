"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";

interface Notification {
  id: string;
  actorName: string;
  type: string;
  reviewId: string | null;
  commentId: string | null;
  contentId: number | null;
  contentType: string | null;
  contentTitle: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t("notifications.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("notifications.minutesAgo").replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo").replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  return t("notifications.daysAgo").replace("{n}", String(days));
}

const iconMap: Record<string, string> = {
  LIKE: "👍",
  DISLIKE: "👎",
  COMMENT: "💬",
  REPLY: "💬",
  COMMENT_LIKE: "👍",
  COMMENT_DISLIKE: "👎",
};

const textKeyMap: Record<string, string> = {
  LIKE: "notifications.liked",
  DISLIKE: "notifications.disliked",
  COMMENT: "notifications.commented",
  REPLY: "notifications.replied",
  COMMENT_LIKE: "notifications.commentLiked",
  COMMENT_DISLIKE: "notifications.commentDisliked",
};

export function NotificationBell({ userId }: { userId: string }) {
  const t = useTranslate();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pendingReads = useRef<Set<string>>(new Set());

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function connect() {
      if (sseRef.current) sseRef.current.close();
      const es = new EventSource("/api/notifications/stream");
      sseRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as { notifications?: Notification[]; unreadCount?: number };
          if (!data?.notifications) return;
          setNotifications((prev) => {
            const pending = pendingReads.current;
            const serverMap = new Map(data.notifications!.map((n) => [n.id, n]));
            for (const local of prev) {
              if (pending.has(local.id) && local.read) {
                const server = serverMap.get(local.id);
                if (server) serverMap.set(local.id, { ...server, read: true });
              }
            }
            return [...serverMap.values()];
          });
          if (typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        sseRef.current = null;
        // Reconnect after 1s
        setTimeout(connect, 1000);
      };
    }

    connect();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAsRead(id: string) {
    pendingReads.current.add(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
        );
        setUnreadCount((prev) => prev + 1);
      }
    } catch (e) {
      console.error("markAsRead network error:", e);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    } finally {
      pendingReads.current.delete(id);
    }
  }

  async function markAllRead() {
    const prevNotifications = notifications;
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    ids.forEach((id) => pendingReads.current.add(id));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) {
        setNotifications(prevNotifications);
        setUnreadCount(prevNotifications.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.error("markAllRead network error:", e);
      setNotifications(prevNotifications);
      setUnreadCount(prevNotifications.filter((n) => !n.read).length);
    } finally {
      ids.forEach((id) => pendingReads.current.delete(id));
    }
  }

  async function handleClick(n: Notification) {
    await markAsRead(n.id);
    setOpen(false);
    if (n.contentId && n.contentType) {
      const isCommentNotif = n.type === "COMMENT_LIKE" || n.type === "COMMENT_DISLIKE";
      const hash = isCommentNotif && n.commentId
        ? `#comment-${n.commentId}`
        : n.reviewId
          ? `#review-${n.reviewId}`
          : "";
      router.push(`/${n.contentType}/${n.contentId}${hash}`);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center rounded-md p-2 text-text-secondary transition-colors hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-accent-brand px-1 text-[10px] font-bold leading-tight text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-md border border-border-subtle bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <span className="text-sm font-semibold text-white">
              {t("notifications.title")}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent-brand transition-colors hover:text-accent-hover"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {unreadCount === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-secondary">
                {t("notifications.empty")}
              </p>
            ) : (
              notifications.filter((n) => !n.read).map((n) => {
                const content = (
                  <div className="flex w-full gap-3 bg-accent-brand/5 px-4 py-3 transition-colors hover:bg-base/50">
                    <span className="mt-0.5 shrink-0 text-base">
                      {iconMap[n.type] ?? "🔔"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {n.actorName}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(textKeyMap[n.type] ?? "notifications.commented")}
                        {n.contentTitle && <span className="text-text-secondary/70"> &mdash; {n.contentTitle}</span>}
                      </p>
                      {n.message && (
                        <p className="mt-0.5 truncate text-[10px] text-text-secondary/40">
                          &ldquo;{n.message}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-text-secondary/50">
                        {mounted ? timeAgo(n.createdAt, t) : ""}
                      </p>
                    </div>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-brand" />
                  </div>
                );

                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="w-full"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
          <div className="border-t border-border-subtle p-3">
            <button
              onClick={() => { setOpen(false); router.push("/notifications"); }}
              className="w-full text-center text-xs text-accent-brand transition-colors hover:text-accent-hover"
            >
              {t("notifications.viewAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
