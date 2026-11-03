"use client";

import React from "react";
import { ShippingCmsTheme, CornerRadiusPreset, ShadowIntensityPreset } from "@/types/shipping-cms";
import { DEFAULT_SHIPPING_THEME_OFFWHITE, DEFAULT_SHIPPING_THEME_DARK } from "@/lib/shipping-cms-defaults";
import { CmsColorPicker } from "./cms-color-picker";
import { CmsContrastMeter } from "./cms-contrast-meter";
import { Sparkles, Moon, RotateCcw, Palette } from "lucide-react";

interface CmsThemeEditorProps {
  theme: ShippingCmsTheme;
  onChange: (updated: ShippingCmsTheme) => void;
}

export function CmsThemeEditor({ theme, onChange }: CmsThemeEditorProps) {
  const applyPreset = (preset: "offwhite" | "dark" | "default") => {
    if (preset === "offwhite" || preset === "default") {
      onChange({ ...DEFAULT_SHIPPING_THEME_OFFWHITE });
    } else if (preset === "dark") {
      onChange({ ...DEFAULT_SHIPPING_THEME_DARK });
    }
  };

  const updateColor = (key: keyof ShippingCmsTheme, value: string) => {
    onChange({
      ...theme,
      [key]: value,
      preset_name: "custom",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Barra de Presets com 1 Clique */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Palette size={15} className="text-amber-400" />
            <span>Presets de Estilo da Marca</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Alterne entre temas ou personalize individualmente cada token visual.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset("offwhite")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              theme.preset_name === "offwhite_ventara"
                ? "bg-[#FAF8F4] text-[#06111F] ring-2 ring-amber-400 shadow-md"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Sparkles size={13} className="text-amber-600" />
            <span>Off-white Ventara (Atual)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("dark")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              theme.preset_name === "dark_ventara"
                ? "bg-slate-950 text-white ring-2 ring-amber-400 shadow-md"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Moon size={13} className="text-blue-400" />
            <span>Escuro Ventara (Clássico)</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("default")}
            title="Restaurar padrão inicial"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Medidor e Auditoria de Contraste WCAG AA */}
      <CmsContrastMeter
        primaryText={theme.primary_text_color}
        pageBackground={theme.page_background}
        secondaryText={theme.secondary_text_color}
        accentAmber={theme.accent_amber_text}
        chipBg={theme.chip_background}
      />

      {/* 3. Grid de Cores e Tokens */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Tokens de Cores e Superfícies
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CmsColorPicker
            label="Fundo da Página"
            value={theme.page_background}
            onChange={(v) => updateColor("page_background", v)}
            description="Off-white quente padrão: #FAF8F4"
          />

          <CmsColorPicker
            label="Fundo de Seções Alternadas"
            value={theme.section_alt_background}
            onChange={(v) => updateColor("section_alt_background", v)}
            description="Levemente contrastante: #F3F0E9"
          />

          <CmsColorPicker
            label="Superfície dos Cards"
            value={theme.surface_color}
            onChange={(v) => updateColor("surface_color", v)}
            description="Branco suave para cartões: #FFFFFF"
          />

          <CmsColorPicker
            label="Bordas dos Cards"
            value={theme.border_color}
            onChange={(v) => updateColor("border_color", v)}
            description="Tom areia suave: #E8E3D8"
          />

          <CmsColorPicker
            label="Texto Principal (Títulos e Destaques)"
            value={theme.primary_text_color}
            onChange={(v) => updateColor("primary_text_color", v)}
            description="Azul-marinho profundo: #06111F"
          />

          <CmsColorPicker
            label="Texto Secundário (Descrições)"
            value={theme.secondary_text_color}
            onChange={(v) => updateColor("secondary_text_color", v)}
            description="Azul-acinzentado com contraste AA: #4A5875"
          />

          <CmsColorPicker
            label="Amarelo da Marca (Preenchimentos)"
            value={theme.accent_yellow}
            onChange={(v) => updateColor("accent_yellow", v)}
            description="Amarelo ouro Ventara: #FFD62E"
          />

          <CmsColorPicker
            label="Âmbar Escuro (Textos e Ícones)"
            value={theme.accent_amber_text}
            onChange={(v) => updateColor("accent_amber_text", v)}
            description="Substituto do amarelo para leitura: #9A6700"
          />

          <CmsColorPicker
            label="Fundo de Selos e Chips"
            value={theme.chip_background}
            onChange={(v) => updateColor("chip_background", v)}
            description="Amarelo suave translúcido: #FFF4C7"
          />

          <CmsColorPicker
            label="Bloco de Destaque Regional"
            value={theme.regional_block_background}
            onChange={(v) => updateColor("regional_block_background", v)}
            description="Azul-marinho de ancoragem: #06111F"
          />
        </div>
      </div>

      {/* 4. Estilo de Bordas e Sombras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Arredondamento dos Cantos
          </label>
          <select
            value={theme.corner_radius}
            onChange={(e) =>
              onChange({
                ...theme,
                corner_radius: e.target.value as CornerRadiusPreset,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="none">Retos (0px)</option>
            <option value="subtle">Sutis (8px)</option>
            <option value="medium">Médios (16px - Padrão)</option>
            <option value="rounded">Super Arredondados (24px)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Intensidade das Sombras
          </label>
          <select
            value={theme.shadow_intensity}
            onChange={(e) =>
              onChange({
                ...theme,
                shadow_intensity: e.target.value as ShadowIntensityPreset,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="none">Sem sombra (Flat)</option>
            <option value="subtle">Suave e Difusa (Padrão Off-white)</option>
            <option value="medium">Média com maior elevação</option>
          </select>
        </div>
      </div>
    </div>
  );
}
