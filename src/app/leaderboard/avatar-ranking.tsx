"use client";

import { useState } from "react";

export function AvatarRanking({ src, name }: { src: string | null; name: string }) {
  const [error, setError] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
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