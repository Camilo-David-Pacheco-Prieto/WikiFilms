"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { List, Eye, Clock, Gamepad2 } from "lucide-react";
import { useTranslate } from "@/i18n/language-provider";

type WatchStatus = "WATCHED" | "PLAN_TO_WATCH";

interface WatchlistButtonProps {
  contentId: number;
  title: string;
  posterUrl: string | null;
  type: "movie" | "tv" | "game";
}

export function WatchlistButton({
  contentId,
  title,
  posterUrl,
  type,
}: WatchlistButtonProps) {
  const { data: session } = useSession();
  const t = useTranslate();
  const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isGame = type === "game";

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/watchlist?contentId=${contentId}&type=${type}`)
      .then((res) => res.json())
      .then((data: { status: WatchStatus } | null) => {
        if (data) setCurrentStatus(data.status);
      })
      .catch(() => {});
  }, [session?.user?.id, contentId, type]);

  const setStatus = useCallback(
    async (status: WatchStatus) => {
      if (!session?.user) return;
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId, title, posterUrl, type, status }),
        });
        if (res.ok) {
          setCurrentStatus(status);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
        setOpen(false);
      }
    },
    [session, contentId, title, posterUrl, type],
  );

  const remove = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist?contentId=${contentId}&type=${type}`, { method: "DELETE" });
      if (res.ok) setCurrentStatus(null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [contentId, type]);

  if (!session?.user) return null;

  const watchedIcon = isGame ? Gamepad2 : Eye;
  const WatchedIcon = watchedIcon;

  const icon = currentStatus === "WATCHED" ? WatchedIcon : currentStatus === "PLAN_TO_WATCH" ? Clock : List;
  const Icon = icon;
  const label = currentStatus === "WATCHED"
    ? isGame ? t("watchlistButton.played") : t("watchlistButton.watched")
    : currentStatus === "PLAN_TO_WATCH"
      ? isGame ? t("watchlistButton.planToPlay") : t("watchlistButton.planToWatch")
      : isGame ? t("watchlistButton.addGame") : t("watchlistButton.add");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        data-active={!!currentStatus}
        className="flex items-center gap-2 rounded-md border border-border-subtle px-4 py-2 text-sm font-medium transition-colors hover:border-accent-brand data-[active=true]:border-accent-brand data-[active=true]:bg-accent-brand/10 disabled:opacity-50 text-text-secondary active:scale-95"
      >
        {label}
      </button>
        {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-border-subtle bg-surface py-1 shadow-lg">
            <button
              onClick={() => setStatus("WATCHED")}
              disabled={currentStatus === "WATCHED"}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-default disabled:text-white active:bg-zinc-700"
            >
              {currentStatus === "WATCHED" ? (
                <WatchedIcon className="h-4 w-4 text-green-400" />
              ) : (
                <WatchedIcon className="h-4 w-4" />
              )}
              {currentStatus === "WATCHED" && <span className="text-green-400">✓ </span>}
              {isGame ? t("watchlistButton.markPlayed") : t("watchlistButton.markWatched")}
            </button>
            <button
              onClick={() => setStatus("PLAN_TO_WATCH")}
              disabled={currentStatus === "PLAN_TO_WATCH"}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-default disabled:text-white active:bg-zinc-700"
            >
              {currentStatus === "PLAN_TO_WATCH" ? (
                <Clock className="h-4 w-4 text-yellow-400" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {currentStatus === "PLAN_TO_WATCH" && <span className="text-yellow-400">✓ </span>}
              {isGame ? t("watchlistButton.markPlanToPlay") : t("watchlistButton.markPlanToWatch")}
            </button>
            {currentStatus && (
              <>
                <hr className="border-border-subtle" />
                <button
                  onClick={remove}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-zinc-800 hover:text-white active:bg-zinc-700"
                >
                  {t("watchlistButton.remove")}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
