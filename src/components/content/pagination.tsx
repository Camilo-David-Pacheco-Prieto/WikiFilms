"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/search?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent-brand hover:text-accent-brand disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, currentPage - 2);
          const page = start + i;
          if (page > totalPages) return null;
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              data-active={page === currentPage}
              className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors data-[active=true]:bg-accent-brand data-[active=true]:text-white text-text-secondary hover:bg-zinc-800"
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent-brand hover:text-accent-brand disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
