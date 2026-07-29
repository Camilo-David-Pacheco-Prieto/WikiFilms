"use client";

import { useState } from "react";

export function SafeAvatar({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [error, setError] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ${className ?? "h-9 w-9"}`}>
      {src && !error ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-sm font-bold text-text-secondary">{initial}</span>
      )}
    </div>
  );
}