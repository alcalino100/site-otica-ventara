"use client";

import React from "react";
import { FRAME_COLOR_GROUPS, FRAME_COLOR_PRESETS, FrameColorPreset, swatchBackground } from "@/lib/frame-color-presets";

interface ColorPresetPickerProps {
  /** Nomes de cor já usados neste produto (ficam marcados e não duplicam). */
  usedNames: string[];
  onPick: (preset: FrameColorPreset) => void;
}

/** Cores prontas: um clique adiciona a cor com nome e amostra já preenchidos. */
export function ColorPresetPicker({ usedNames, onPick }: ColorPresetPickerProps) {
  const used = new Set(usedNames.map((n) => n.trim().toLowerCase()).filter(Boolean));

  return (
    <div className="rounded-xl border border-white/10 bg-[#040e17] p-3" data-testid="color-preset-picker">
      <p className="mb-2 text-[11px] font-semibold text-slate-200">
        Cores prontas <span className="font-normal text-slate-400">— clique para adicionar (dá para ajustar depois)</span>
      </p>
      <div className="space-y-2">
        {FRAME_COLOR_GROUPS.map((group) => (
          <div key={group}>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_COLOR_PRESETS.filter((p) => p.group === group).map((p) => {
                const isUsed = used.has(p.name.toLowerCase());
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onPick(p)}
                    disabled={isUsed}
                    title={isUsed ? "Já adicionada" : `Adicionar ${p.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-2.5 text-[11px] font-medium text-slate-100 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white/30"
                      style={{ background: swatchBackground(p.name, p.hex) }}
                    />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
