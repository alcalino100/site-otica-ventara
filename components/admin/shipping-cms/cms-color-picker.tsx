"use client";

import React from "react";

interface CmsColorPickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
  disabled?: boolean;
}

export function CmsColorPicker({
  label,
  value,
  onChange,
  description,
  disabled = false,
}: CmsColorPickerProps) {
  // Garante que o input[type=color] receba sempre um hex válido de 6 caracteres
  const formatColorForPicker = (val: string) => {
    if (!val) return "#000000";
    if (val.startsWith("#") && (val.length === 7 || val.length === 4)) {
      if (val.length === 4) {
        return `#${val[1]}${val[1]}${val[2]}${val[2]}${val[3]}${val[3]}`;
      }
      return val.substring(0, 7);
    }
    return "#000000";
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200">{label}</label>
        <span className="text-[11px] font-mono text-slate-400 uppercase">{value}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Swatch com Input Nativo Oculto */}
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 shadow-xs">
          <input
            type="color"
            value={formatColorForPicker(value)}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            disabled={disabled}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
            aria-label={`Escolher cor para ${label}`}
          />
        </div>

        {/* Input Textual para Hexadecimal Preciso */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="#RRGGBB"
          disabled={disabled}
          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 uppercase focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {description && <p className="text-[10px] text-slate-400 leading-tight">{description}</p>}
    </div>
  );
}
