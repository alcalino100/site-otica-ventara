"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Sliders,
  Check,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sun,
  Moon,
  Copy,
  Info,
} from "lucide-react";
import {
  BACKGROUND_PRESETS,
  BackgroundPresetId,
  getBackgroundPreset,
  resolveBackgroundConfig,
  checkPageToneCompatibility,
  calculateBackgroundContrast,
  DEFAULT_BACKGROUND_CONFIGS,
} from "@/lib/content/background-presets";

interface ContentBackgroundSwitcherProps {
  pageId: string;
  pageTitle: string;
  values: Record<string, any>;
  onFieldChange: (key: string, value: any) => void;
  onApplyToOtherPages?: (targetPages: string[], config: Record<string, any>) => Promise<void>;
  availablePages?: Array<{ id: string; title: string; path: string }>;
}

export function ContentBackgroundSwitcher({
  pageId,
  pageTitle,
  values,
  onFieldChange,
  onApplyToOtherPages,
  availablePages = [],
}: ContentBackgroundSwitcherProps) {
  const [showFineTuning, setShowFineTuning] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTargetPages, setSelectedTargetPages] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  // Fundo atualmente configurado
  const config = resolveBackgroundConfig(values);
  const currentPresetId = (values.backgroundPreset || config.preset) as BackgroundPresetId;
  const currentPresetMeta = getBackgroundPreset(currentPresetId);

  // Avaliação de compatibilidade de tom e contraste
  const compatibility = checkPageToneCompatibility(pageId, currentPresetId);
  const contrast = calculateBackgroundContrast(config);

  // Troca de preset
  const handleSelectPreset = (presetId: BackgroundPresetId) => {
    onFieldChange("backgroundPreset", presetId);

    // Se o preset possui configurações padrão específicas, inicializa
    const presetDefaults = DEFAULT_BACKGROUND_CONFIGS[presetId];
    if (presetDefaults) {
      if (presetId === "optisync") {
        onFieldChange("beamsIntensity", presetDefaults.beamsIntensity);
        onFieldChange("glowIntensity", presetDefaults.glowIntensity);
        onFieldChange("enableAnimation", presetDefaults.enableAnimation);
        onFieldChange("enableHudGrid", presetDefaults.enableHudGrid);
        onFieldChange("gradientBaseFrom", presetDefaults.gradientBaseFrom);
        onFieldChange("gradientBaseTo", presetDefaults.gradientBaseTo);
      } else if (presetId === "dark") {
        onFieldChange("gradientBaseFrom", presetDefaults.gradientBaseFrom);
        onFieldChange("gradientBaseTo", presetDefaults.gradientBaseTo);
      } else if (presetId === "offwhite") {
        onFieldChange("gradientBaseFrom", presetDefaults.gradientBaseFrom);
        onFieldChange("gradientBaseTo", presetDefaults.gradientBaseTo);
      }
    }
  };

  // Restauração para os padrões do preset ativo
  const handleResetToPresetDefaults = () => {
    const presetDefaults = DEFAULT_BACKGROUND_CONFIGS[currentPresetId];
    if (presetDefaults) {
      Object.entries(presetDefaults).forEach(([k, v]) => {
        onFieldChange(k, v);
      });
    }
  };

  // Disparo de aplicação em outras páginas
  const handleConfirmApplyToPages = async () => {
    if (!onApplyToOtherPages || selectedTargetPages.length === 0) return;
    setIsApplying(true);
    setApplySuccessMessage(null);
    try {
      const bgPayload = {
        backgroundPreset: currentPresetId,
        beamsIntensity: values.beamsIntensity,
        glowIntensity: values.glowIntensity,
        enableAnimation: values.enableAnimation,
        enableHudGrid: values.enableHudGrid,
        gradientBaseFrom: values.gradientBaseFrom,
        gradientBaseTo: values.gradientBaseTo,
        colorVioletLeft: values.colorVioletLeft,
        colorVioletGlow: values.colorVioletGlow,
        colorBlueRight: values.colorBlueRight,
        colorMagentaSpot: values.colorMagentaSpot,
        customBgDesktopUrl: values.customBgDesktopUrl,
        customBgMobileUrl: values.customBgMobileUrl,
        bgOverlayOpacity: values.bgOverlayOpacity,
        bgFocalPoint: values.bgFocalPoint,
      };
      await onApplyToOtherPages(selectedTargetPages, bgPayload);
      setApplySuccessMessage(`Fundo aplicado com sucesso em ${selectedTargetPages.length} página(s)!`);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccessMessage(null);
        setSelectedTargetPages([]);
      }, 1800);
    } catch (err: any) {
      alert(`Erro ao aplicar em outras páginas: ${err.message || "Falha na requisição"}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Luz ambiente de destaque no topo do card */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Cabeçalho do Bloco com Status e Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Palette size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Fundo da Página & Estilo Visual
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                  {currentPresetMeta.name}
                </span>
                {currentPresetMeta.tone === "dark" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                    <Moon size={10} />
                    <span>Tom Escuro</span>
                  </span>
                ) : currentPresetMeta.tone === "light" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-500/30 text-amber-300">
                    <Sun size={10} />
                    <span>Tom Claro</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
                    <span>Tom Neutro</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha o preset de fundo para &quot;{pageTitle}&quot; ou personalize os feixes, brilho e imagem.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
          {availablePages.length > 0 && onApplyToOtherPages && (
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Replicar este mesmo fundo para outras páginas do site"
            >
              <Copy size={13} className="text-amber-400" />
              <span>Aplicar em outras páginas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFineTuning(!showFineTuning)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showFineTuning
                ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
            }`}
          >
            <Sliders size={13} className="text-amber-400" />
            <span>Ajustes Finos</span>
            {showFineTuning ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Alerta de Incompatibilidade de Tom (Se Houver) */}
      {!compatibility.isCompatible && compatibility.warning && (
        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Aviso de Contraste e Legibilidade:</span>
            <p className="text-amber-300/90 leading-relaxed">{compatibility.warning}</p>
          </div>
        </div>
      )}

      {/* 3. Grade Visual de Presets Disponíveis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {BACKGROUND_PRESETS.map((preset) => {
          const isSelected = currentPresetId === preset.id;
          const presetCompatibility = checkPageToneCompatibility(pageId, preset.id);

          return (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectPreset(preset.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectPreset(preset.id);
                }
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isSelected
                  ? "bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/20 shadow-lg"
                  : "bg-slate-950/50 hover:bg-slate-800/50 border-slate-800"
              }`}
            >
              <div>
                {/* Miniatura Swatch Visual Renderizada */}
                <div
                  className="w-full h-16 rounded-xl border border-white/10 relative overflow-hidden mb-2.5 shadow-inner"
                  style={{ background: preset.previewGradient }}
                >
                  {/* Se for OptiSYNC, desenha feixe miniatura */}
                  {preset.id === "optisync" && (
                    <>
                      <div className="absolute -top-4 -left-4 w-14 h-14 rounded-full bg-[#7A2CFF]/40 blur-md pointer-events-none" />
                      <div className="absolute top-2 -right-4 w-12 h-12 rounded-full bg-[#0044C9]/40 blur-md pointer-events-none" />
                      <div className="absolute inset-0 lens-hud-grid opacity-30 pointer-events-none" />
                    </>
                  )}

                  {/* Checkmark Selecionado */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Badge do Preset */}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 backdrop-blur-sm text-white/90">
                    {preset.badge}
                  </span>
                </div>

                {/* Título e Descrição */}
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{preset.name}</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Rodapé do Card com Selo de Tom */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Tom:</span>
                <span
                  className={`font-semibold ${
                    preset.tone === "dark"
                      ? "text-indigo-400"
                      : preset.tone === "light"
                      ? "text-amber-400"
                      : "text-slate-400"
                  }`}
                >
                  {preset.tone === "dark" ? "Escuro" : preset.tone === "light" ? "Claro" : "Neutro"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Medidor de Contraste WCAG AA em Tempo Real */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              contrast.passesAA ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400"
            }`}
          />
          <div>
            <span className="font-bold text-white">Contraste com a Tipografia Principal: </span>
            <span className="font-mono text-slate-300">{contrast.formattedRatio}</span>
            <span className="text-slate-400 ml-1.5">({contrast.scoreText})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-full font-bold ${
              contrast.passesAA
                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                : "bg-red-950 text-red-300 border border-red-500/30"
            }`}
          >
            {contrast.passesAA ? "Aprovado WCAG AA" : "Atenção WCAG"}
          </span>
          <span className="text-slate-400">Texto: {config.tone === "light" ? "#06111F" : "#F4F6FF"}</span>
        </div>
      </div>

      {/* 5. Painel Expansível de Ajustes Finos */}
      {showFineTuning && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-amber-400" />
              <span>Ajustes Finos de Parâmetros ({currentPresetMeta.name})</span>
            </h4>
            <button
              type="button"
              onClick={handleResetToPresetDefaults}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={11} />
              <span>Restaurar Padrão do Preset</span>
            </button>
          </div>

          {/* Ajustes específicos do Preset OptiSYNC */}
          {currentPresetId === "optisync" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Intensidade dos Feixes */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Intensidade dos Feixes Laterais</span>
                    <span className="font-mono text-amber-400 font-bold">{config.beamsIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.beamsIntensity}
                    onChange={(e) => onFieldChange("beamsIntensity", Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />
                  <p className="text-[10px] text-slate-400">
                    Controla a visibilidade dos feixes violeta (#4C01AE) e azul (#0044C9).
                  </p>
                </div>

                {/* Intensidade do Brilho Central */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Intensidade do Brilho Central (Magenta)</span>
                    <span className="font-mono text-amber-400 font-bold">{config.glowIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.glowIntensity}
                    onChange={(e) => onFieldChange("glowIntensity", Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />
                  <p className="text-[10px] text-slate-400">
                    Controla o ponto de luz central (#B93DAA) atrás das lentes.
                  </p>
                </div>
              </div>

              {/* Toggles de Animação e Grade HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.enableAnimation}
                    onChange={(e) => onFieldChange("enableAnimation", e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-800 border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Animação Contínua (Pulse Glow)</span>
                    <span className="text-slate-400 text-[11px]">
                      Pulsar suavemente os feixes ópticos (desliga em prefers-reduced-motion).
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.enableHudGrid}
                    onChange={(e) => onFieldChange("enableHudGrid", e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-800 border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Grade HUD Tecnológica</span>
                    <span className="text-slate-400 text-[11px]">
                      Grade geométrica sutil com linhas de precisão milimétrica.
                    </span>
                  </div>
                </label>
              </div>

              {/* Cores Base Personalizadas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Gradiente Início</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.gradientBaseFrom || "#000933"}
                      onChange={(e) => onFieldChange("gradientBaseFrom", e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.gradientBaseFrom || "#000933"}
                      onChange={(e) => onFieldChange("gradientBaseFrom", e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Gradiente Fim</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.gradientBaseTo || "#020716"}
                      onChange={(e) => onFieldChange("gradientBaseTo", e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.gradientBaseTo || "#020716"}
                      onChange={(e) => onFieldChange("gradientBaseTo", e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Feixe Violeta</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorVioletLeft || "#4C01AE"}
                      onChange={(e) => onFieldChange("colorVioletLeft", e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colorVioletLeft || "#4C01AE"}
                      onChange={(e) => onFieldChange("colorVioletLeft", e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Feixe Azul</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorBlueRight || "#0044C9"}
                      onChange={(e) => onFieldChange("colorBlueRight", e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colorBlueRight || "#0044C9"}
                      onChange={(e) => onFieldChange("colorBlueRight", e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ajustes específicos do Preset Imagem Customizada */}
          {currentPresetId === "custom_image" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">URL da Imagem (Desktop)</label>
                  <input
                    type="text"
                    value={values.customBgDesktopUrl || ""}
                    onChange={(e) => onFieldChange("customBgDesktopUrl", e.target.value)}
                    placeholder="https://.../fundo-desktop.webp"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">URL da Imagem (Mobile - Opcional)</label>
                  <input
                    type="text"
                    value={values.customBgMobileUrl || ""}
                    onChange={(e) => onFieldChange("customBgMobileUrl", e.target.value)}
                    placeholder="https://.../fundo-mobile.webp"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Opacidade do Overlay Escuro</span>
                    <span className="font-mono text-amber-400 font-bold">{config.bgOverlayOpacity ?? 70}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.bgOverlayOpacity ?? 70}
                    onChange={(e) => onFieldChange("bgOverlayOpacity", Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />
                  <p className="text-[10px] text-slate-400">
                    Garante legibilidade ao escurecer a imagem de fundo por baixo do conteúdo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Ponto Focal da Imagem</label>
                  <select
                    value={config.bgFocalPoint || "center"}
                    onChange={(e) => onFieldChange("bgFocalPoint", e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="center">Centro (Padrão)</option>
                    <option value="top">Topo</option>
                    <option value="bottom">Base</option>
                    <option value="left">Esquerda</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Ajustes simples para Dark e Off-white */}
          {(currentPresetId === "dark" || currentPresetId === "offwhite") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Cor Base Inicial</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.gradientBaseFrom}
                    onChange={(e) => onFieldChange("gradientBaseFrom", e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.gradientBaseFrom}
                    onChange={(e) => onFieldChange("gradientBaseFrom", e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Cor Base Final</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.gradientBaseTo}
                    onChange={(e) => onFieldChange("gradientBaseTo", e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.gradientBaseTo}
                    onChange={(e) => onFieldChange("gradientBaseTo", e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {currentPresetId === "default" && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info size={14} className="text-slate-500 shrink-0" />
              <span>O modo padrão utiliza as cores do layout base do site sem nenhuma camada de estilo adicional.</span>
            </div>
          )}
        </div>
      )}

      {/* 6. Modal de Aplicação em Outras Páginas (Multisseleção) */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Copy size={16} className="text-amber-400" />
                  <span>Aplicar Fundo em Outras Páginas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione as páginas que devem herdar o preset &quot;{currentPresetMeta.name}&quot; e suas configurações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {applySuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{applySuccessMessage}</span>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {availablePages
                    .filter((p) => p.id !== pageId)
                    .map((page) => {
                      const isSelected = selectedTargetPages.includes(page.id);
                      const pageCompat = checkPageToneCompatibility(page.id, currentPresetId);

                      return (
                        <label
                          key={page.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-amber-400/10 border-amber-400/40 text-white"
                              : "bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTargetPages((prev) => [...prev, page.id]);
                                } else {
                                  setSelectedTargetPages((prev) => prev.filter((id) => id !== page.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-800 border-slate-700"
                            />
                            <div>
                              <span className="font-bold block">{page.title}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{page.path}</span>
                            </div>
                          </div>

                          {!pageCompat.isCompatible && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              Atenção Tom
                            </span>
                          )}
                        </label>
                      );
                    })}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={selectedTargetPages.length === 0 || isApplying}
                    onClick={handleConfirmApplyToPages}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isApplying ? "Aplicando..." : `Aplicar em ${selectedTargetPages.length} página(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
