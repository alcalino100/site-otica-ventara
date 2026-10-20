import React from "react";
import { Skeleton } from "../ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Carregando produtos">
      {[1, 2, 3, 4].map((i) => (
        <article className="product product-skeleton-card" key={i}>
          <div className="product-image skeleton-wrapper">
            <Skeleton className="w-full h-full min-h-[210px] bg-slate-200/60" />
          </div>
          <div className="product-info space-y-2 pt-3">
            <Skeleton className="h-4 w-3/4 bg-slate-200" />
            <Skeleton className="h-3 w-1/2 bg-slate-200/70" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-1/3 bg-slate-200/50" />
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
