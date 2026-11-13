"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hand, RotateCcw, Sparkles, X } from "lucide-react";

export interface ImageFocusValue {
  x: number;
  y: number;
}

interface ImageFocusEditorProps {
  imageUrl: string;
  productName?: string;
  /** Posição já salva (%). Sem valor = enquadramento automático do site. */
  initialX?: number | null;
  initialY?: number | null;
  /** `null` = voltar ao enquadramento automático. */
  onApply: (focus: ImageFocusValue | null) => void;
  onClose: () => void;
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

interface PanFrameProps {
  url: string;
  label: string;
  aspectClass: string;
  position: ImageFocusValue;
  natural: { w: number; h: number } | null;
  onChange: (next: ImageFocusValue) => void;
}

/**
 * Moldura do card: arraste a foto (dedo ou mouse) para escolher qual parte aparece.
 * Usa o mesmo cálculo do `object-position` do site, então o que se vê aqui é o que o cliente vê.
 */
function PanFrame({ url, label, aspectClass, position, natural, onChange }: PanFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Quanto da foto "sobra" para fora da moldura em cada eixo (em px)
  const overflow = () => {
    const el = frameRef.current;
    if (!el || !natural) return { ox: 0, oy: 0 };
    const { width, height } = el.getBoundingClientRect();
    const scale = Math.max(width / natural.w, height / natural.h);
    return {
      ox: Math.max(0, natural.w * scale - width),
      oy: Math.max(0, natural.h * scale - height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: position.x, y: position.y };
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const { ox, oy } = overflow();
    // Arrastar a foto para a direita revela o lado esquerdo (posição diminui)
    onChange({
      x: ox > 1 ? round1(clamp(start.x - ((e.clientX - start.px) / ox) * 100)) : start.x,
      y: oy > 1 ? round1(clamp(start.y - ((e.clientY - start.py) / oy) * 100)) : start.y,
    });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = {
      // A seta indica para onde a foto anda
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    onChange({ x: round1(clamp(position.x + move[0])), y: round1(clamp(position.y + move[1])) });
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-slate-300">{label}</p>
      <div
        ref={frameRef}
        role="group"
        tabIndex={0}
        aria-label={`${label}: arraste a foto ou use as setas do teclado para ajustar a posição`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl border border-white/15 bg-slate-900 touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover"
          style={{ objectPosition: `${position.x}% ${position.y}%` }}
        />
        {/* Linhas-guia do centro: ajudam a deixar a armação no meio */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px border-l border-dashed border-white/50" />
          <div className="absolute left-0 top-1/2 h-px w-full border-t border-dashed border-white/50" />
        </div>
        {!dragging && (
          <span className="pointer-events-none absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <Hand size={11} aria-hidden="true" /> Arraste a foto
          </span>
        )}
      </div>
    </div>
  );
}

export function ImageFocusEditor({
  imageUrl,
  productName,
  initialX,
  initialY,
  onApply,
  onClose,
}: ImageFocusEditorProps) {
  const [position, setPosition] = useState<ImageFocusValue>({
    x: initialX ?? 50,
    y: initialY ?? 50,
  });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  // Lê o tamanho real da foto para calcular quanto ela pode se mover dentro da moldura
  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setNatural({ w: probe.naturalWidth, h: probe.naturalHeight });
    probe.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-focus-title"
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#081724] p-4 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="image-focus-title" className="text-base font-bold text-white">
              Ajustar posição da foto
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {productName ? <strong className="text-white">{productName}</strong> : "Esta foto"} — arraste a foto
              dentro da moldura até a armação ficar no meio. As duas molduras mostram como o card aparece no
              celular e no computador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PanFrame
            url={imageUrl}
            label="No celular"
            aspectClass="aspect-[5/4]"
            position={position}
            natural={natural}
            onChange={setPosition}
          />
          <PanFrame
            url={imageUrl}
            label="No computador"
            aspectClass="aspect-[4/3]"
            position={position}
            natural={natural}
            onChange={setPosition}
          />
        </div>

        <p className="mt-3 text-[11px] text-slate-400" aria-live="polite">
          Posição: {position.x}% horizontal · {position.y}% vertical. Depois de aplicar, clique em{" "}
          <strong className="text-slate-200">Salvar</strong> no fim da página.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPosition({ x: 50, y: 50 })}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/60 hover:text-white"
            >
              <RotateCcw size={13} aria-hidden="true" /> Centralizar
            </button>
            <button
              type="button"
              onClick={() => onApply(null)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/60 hover:text-white"
            >
              <Sparkles size={13} aria-hidden="true" /> Voltar ao automático
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 rounded-lg px-4 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onApply(position)}
              className="min-h-[44px] flex-1 rounded-lg bg-amber-400 px-5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 sm:flex-none"
            >
              Aplicar posição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
