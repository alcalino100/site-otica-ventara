"use client";

import React from "react";
import { PageBackgroundConfig } from "@/lib/content/background-presets";

interface PageBackgroundProps {
  config: PageBackgroundConfig;
  className?: string;
  /**
   * "page" (padrão): camada fixa que cobre a viewport inteira da página.
   * "section": camada absoluta contida em uma seção (o pai precisa ser `relative overflow-hidden`).
   */
  scope?: "page" | "section";
}

/**
 * Componente Universal de Fundo de Página (Camada Fixa e Acessível).
 * Suporta o Fundo Tecnológico OptiSYNC (feixes, glows e grade HUD),
 * fundos minimalistas escuro e off-white, imagens customizadas com overlay
 * e modo padrão transparente de zero overhead.
 */
export function PageBackground({ config, className = "", scope = "page" }: PageBackgroundProps) {
  // Preset 'default' não adiciona nenhuma camada no DOM
  if (config.preset === "default") {
    return null;
  }

  // Posicionamento: fixo na viewport (página) ou absoluto dentro da seção
  const position = scope === "section" ? "absolute" : "fixed";
  // Em seção, o tema tecnológico fornece os tokens da grade HUD fora das páginas OptiSYNC
  const themeScope = scope === "section" ? "theme-futuristic-lenses" : "";

  // 1. Preset de Imagem Personalizada
  if (config.preset === "custom_image" && config.customBgDesktopUrl) {
    return (
      <div
        className={`${position} inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 w-full h-full">
          <picture>
            {config.customBgMobileUrl && (
              <source media="(max-width: 768px)" srcSet={config.customBgMobileUrl} />
            )}
            <img
              src={config.customBgDesktopUrl}
              alt=""
              className={`w-full h-full object-cover object-${config.bgFocalPoint || "center"}`}
            />
          </picture>
          <div
            className="absolute inset-0 bg-[#000933]"
            style={{ opacity: (config.bgOverlayOpacity ?? 70) / 100 }}
          />
        </div>
      </div>
    );
  }

  // 2. Preset Escuro Ventara Minimalista
  if (config.preset === "dark") {
    return (
      <div
        className={`${position} inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${config.gradientBaseFrom || "#06111F"} 0%, ${config.gradientBaseTo || "#02070D"} 75%, #01040A 100%)`,
          }}
        >
          {/* Vinheta ambiente suave para profundidade de luxo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />
        </div>
      </div>
    );
  }

  // 3. Preset Off-white Ventara
  if (config.preset === "offwhite") {
    return (
      <div
        className={`${position} inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${config.gradientBaseFrom || "#FAF8F4"} 0%, ${config.gradientBaseTo || "#F5F1EB"} 60%, #EFE9DF 100%)`,
          }}
        >
          {/* Linha sutil de transição superior */}
          <div className="absolute top-0 inset-x-0 h-px bg-slate-300/30" />
        </div>
      </div>
    );
  }

  // 4. Preset Tecnológico OptiSYNC (Default fallback)
  // Preserva 100% da assinatura visual do design aprovado pelo cliente
  const colorBaseFrom = config.gradientBaseFrom || "#000933";
  const colorBaseTo = config.gradientBaseTo || "#020716";
  const colorVioletLeft = config.colorVioletLeft || "#4C01AE";
  const colorVioletGlow = config.colorVioletGlow || "#7A2CFF";
  const colorBlueRight = config.colorBlueRight || "#0044C9";
  const colorMagentaSpot = config.colorMagentaSpot || "#B93DAA";

  return (
    <div
      className={`${position} inset-0 pointer-events-none z-0 overflow-hidden ${themeScope} ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${colorBaseFrom} 0%, ${colorBaseTo} 70%, #00051E 100%)`,
        }}
      >
        {/* Feixe Esquerdo: Violeta Profundo */}
        <div
          className={`absolute -top-16 -left-20 sm:-top-32 sm:-left-40 w-[320px] h-[340px] sm:w-[680px] sm:h-[720px] rounded-full blur-2xl sm:blur-[140px] pointer-events-none transform -rotate-12 ${
            config.enableAnimation ? "sm:animate-lens-glow motion-reduce:animate-none" : ""
          }`}
          style={{
            background: `linear-gradient(135deg, ${colorVioletLeft} 0%, ${colorVioletGlow} 40%, transparent 70%)`,
            opacity: ((config.beamsIntensity ?? 85) / 100) * 0.6,
          }}
        />

        {/* Feixe Direito: Azul Elétrico */}
        <div
          className="absolute top-10 right-[-60px] sm:top-20 sm:right-[-100px] w-[280px] h-[300px] sm:w-[620px] sm:h-[650px] rounded-full blur-2xl sm:blur-[150px] pointer-events-none transform rotate-45"
          style={{
            background: `linear-gradient(225deg, ${colorBlueRight} 0%, transparent 65%)`,
            opacity: ((config.beamsIntensity ?? 85) / 100) * 0.5,
          }}
        />

        {/* Ponto Central de Brilho Magenta */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[160px] sm:w-[700px] sm:h-[320px] blur-2xl sm:blur-[150px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colorMagentaSpot} 0%, ${colorVioletGlow} 35%, transparent 75%)`,
            opacity: ((config.glowIntensity ?? 80) / 100) * 0.35,
          }}
        />

        {/* Grade HUD Tecnológica Óptica */}
        {config.enableHudGrid !== false && (
          <div className="absolute inset-0 lens-hud-grid opacity-20 sm:opacity-25" />
        )}

        {/* Linhas Horizontais de Luz (HUD) */}
        <div className="absolute top-[35%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0044C9]/40 to-transparent" />
        <div className="absolute top-[65%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7A2CFF]/30 to-transparent" />
      </div>
    </div>
  );
}
