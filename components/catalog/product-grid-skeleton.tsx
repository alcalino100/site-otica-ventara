import React from "react";
import { Skeleton } from "../ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div
      className="flex sm:grid flex-row flex-nowrap sm:flex-none overflow-x-auto sm:overflow-visible overflow-y-hidden gap-4 sm:gap-6 pb-2 sm:pb-0 sm:grid-cols-2 lg:grid-cols-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      aria-busy="true"
      aria-label="Carregando produtos"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="shrink-0 w-[84vw] max-w-[320px] sm:w-auto sm:max-w-none">
          <article className="product product-skeleton-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between h-[460px]">
            <div className="product-image skeleton-wrapper bg-slate-50 p-6 flex items-center justify-center">
              <Skeleton className="w-full h-44 rounded-xl bg-slate-200/60" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1">
                    <Skeleton className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                    <Skeleton className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                    <Skeleton className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                  </div>
                  <Skeleton className="h-3 w-16 bg-slate-200/70" />
                </div>
                <Skeleton className="h-4 w-3/4 bg-slate-200 rounded-md" />
                <Skeleton className="h-3 w-1/2 bg-slate-200/70 rounded-md" />
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-24 bg-slate-200" />
                    <Skeleton className="h-2.5 w-32 bg-slate-200/60" />
                  </div>
                  <Skeleton className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Skeleton className="h-8 rounded-xl bg-slate-100" />
                  <Skeleton className="h-8 rounded-xl bg-slate-100" />
                </div>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
