"use client";

import { useId, useState } from "react";
import { optimizedImgProps } from "@/lib/image-url";

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
  testId?: string;
}

/** Comparação antes/depois: arraste o seletor (ou use as setas do teclado). Quadro sempre 4:3 para alinhar todos os cards. */
export function ComparisonSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel, alt, testId }: Props) {
  const [pos, setPos] = useState(50);
  const id = useId();
  const widths = [640, 828, 1080];
  return (
    <div data-testid={testId} className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...optimizedImgProps(afterSrc, widths)} sizes="(min-width: 1024px) 560px, 92vw" alt={`${alt} — ${afterLabel}`} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...optimizedImgProps(beforeSrc, widths)} sizes="(min-width: 1024px) 560px, 92vw" alt={`${alt} — ${beforeLabel}`} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">{beforeLabel}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-violet-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">{afterLabel}</span>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_12px_rgba(168,85,247,0.9)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-violet-600 text-sm text-white shadow-lg">⇆</span>
      </div>
      <label htmlFor={id} className="sr-only">Comparar: {beforeLabel} e {afterLabel}</label>
      <input id={id} type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" data-testid={testId ? `${testId}-range` : undefined} />
    </div>
  );
}
