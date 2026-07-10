"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslate } from "@/i18n/language-provider";

interface TrailerModalProps {
  videoKey: string;
  onClose: () => void;
}

export function TrailerModal({ videoKey, onClose }: TrailerModalProps) {
  const t = useTranslate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 transition-opacity duration-200 sm:p-4 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-5xl transition-all duration-200 ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 z-10 flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white md:-top-10"
        >
          <span className="hidden sm:inline">{t("trailerModal.close")}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg leading-none backdrop-blur-sm transition-colors hover:bg-white/20 sm:h-6 sm:w-6">
            &times;
          </span>
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-lg shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={t("trailerModal.title")}
          />
        </div>
      </div>
    </div>
  );
}
