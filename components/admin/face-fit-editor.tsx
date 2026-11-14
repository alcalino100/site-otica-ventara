"use client";

import React from "react";
import { Smile, Sparkles, Eraser } from "lucide-react";
import { FACE_SHAPES, FIT_LEVELS, FaceShapeFit, FaceShapeId, FitLevel, hasFaceFit, suggestFaceFit } from "@/lib/face-shapes";

interface FaceFitEditorProps {
  value: FaceShapeFit;
  onChange: (next: FaceShapeFit) => void;
  /** Formato da armação (para sugerir uma avaliação inicial). */
  frameShape?: string;
}

/**
 * Para cada formato de rosto, o quanto esta armação combina.
 * Aparece para o cliente final em "Indicação de Geometria Facial" (meu rosto é ...).
 */
export function FaceFitEditor({ value, onChange, frameShape }: FaceFitEditorProps) {
  const setLevel = (face: FaceShapeId, level: FitLevel | null) => {
    const next = { ...value };
    if (level === null || next[face] === level) delete next[face];
    else next[face] = level;
    onChange(next);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Smile size={16} className="text-amber-400" aria-hidden="true" />
            Indicação por formato de rosto
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
            Marque o quanto esta armação combina com cada rosto. O cliente escolhe o formato do rosto na página do
            produto e vê a compatibilidade em %. Rosto sem marcação não é exibido.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(suggestFaceFit(frameShape))}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/60 hover:text-white"
          >
            <Sparkles size={13} aria-hidden="true" /> Sugerir pelo formato{frameShape ? ` (${frameShape})` : ""}
          </button>
          {hasFaceFit(value) && (
            <button
              type="button"
              onClick={() => onChange({})}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition-colors hover:border-rose-400/60 hover:text-white"
            >
              <Eraser size={13} aria-hidden="true" /> Limpar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {FACE_SHAPES.map((face) => (
          <div
            key={face.id}
            role="radiogroup"
            aria-label={`Compatibilidade com rosto ${face.label}`}
            className="grid grid-cols-[92px_1fr] items-center gap-2 sm:grid-cols-[110px_1fr]"
          >
            <span className="text-xs font-semibold text-slate-200">{face.label}</span>
            <div className="grid grid-cols-4 gap-1.5">
              {FIT_LEVELS.map((lv) => {
                const active = value[face.id] === lv.id;
                return (
                  <button
                    key={lv.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLevel(face.id, lv.id)}
                    className={`min-h-[40px] rounded-lg border px-1 text-[11px] font-semibold leading-tight transition-colors ${
                      active
                        ? "border-amber-400 bg-amber-400 text-slate-950"
                        : "border-slate-700 text-slate-300 hover:border-amber-400/60 hover:text-white"
                    }`}
                  >
                    {lv.label}
                    <span className="block text-[10px] font-medium opacity-80">{lv.percent}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Clique de novo no nível marcado para desmarcar.</p>
    </section>
  );
}
