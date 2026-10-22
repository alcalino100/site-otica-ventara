import React, { memo } from "react";

interface FrameProps {
  solar?: boolean;
  round?: boolean;
  amber?: boolean;
  hero?: boolean;
  customColor?: string;
  className?: string;
}

export const FrameArt = memo(function FrameArt({
  solar = false,
  round = false,
  amber = false,
  hero = false,
  customColor,
  className = "",
}: FrameProps) {
  const frameColor = customColor || (amber ? "#78350f" : "#0d1b2a");
  const strokeColor = customColor || (amber ? "#92400e" : "#1e293b");
  const rimHighlight = customColor ? "#ffffff" : amber ? "#f59e0b" : "#475569";
  const gradientId = hero ? "heroLensGrad" : solar ? "solarLensGrad" : "clearLensGrad";

  return (
    <svg
      className={`${hero ? "frame-art hero-frame" : "frame-art"} ${className}`}
      viewBox="0 0 760 360"
      role="img"
      aria-label={solar ? "Óculos de sol Ventara" : "Armação de óculos Ventara"}
    >
      <defs>
        {/* Gradiente de Lentes */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop
            stopColor={solar ? "#0f172a" : "#38bdf8"}
            stopOpacity={solar ? "0.95" : hero ? "0.28" : "0.20"}
          />
          <stop
            offset="0.5"
            stopColor={solar ? "#1e293b" : "#0284c7"}
            stopOpacity={solar ? "0.85" : hero ? "0.15" : "0.08"}
          />
          <stop
            offset="1"
            stopColor={solar ? "#334155" : "#0ea5e9"}
            stopOpacity={solar ? "0.92" : hero ? "0.22" : "0.02"}
          />
        </linearGradient>

        {/* Brilho Especular Superior do Acetato */}
        <linearGradient id="acetateSheen" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>

        {/* Filtro de Sombra Suave */}
        <filter id="frameDepth" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      <g filter={hero ? "url(#frameDepth)" : undefined}>
        {/* Hastes Laterais */}
        <path
          d="M120 125 L65 52 Q58 40 76 36 L270 70 M640 125 L695 52 Q702 40 684 36 L490 70"
          fill="none"
          stroke={frameColor}
          strokeWidth={hero ? "16" : "13"}
          strokeLinecap="round"
        />
        {/* Detalhe Dourado da Haste Ventara */}
        <path
          d="M86 64 L96 74 L103 62 M674 64 L664 74 L657 62"
          stroke="#FFD62E"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Aro Esquerdo */}
        {round ? (
          <ellipse
            cx="210"
            cy="175"
            rx="125"
            ry="95"
            fill={`url(#${gradientId})`}
            stroke={frameColor}
            strokeWidth={hero ? "20" : "16"}
          />
        ) : (
          <path
            d="M95 125 Q185 95 315 122 Q340 144 320 228 Q308 268 252 272 L160 266 Q108 261 100 216 Z"
            fill={`url(#${gradientId})`}
            stroke={frameColor}
            strokeWidth={hero ? "20" : "16"}
            strokeLinejoin="round"
          />
        )}

        {/* Aro Direito */}
        {round ? (
          <ellipse
            cx="550"
            cy="175"
            rx="125"
            ry="95"
            fill={`url(#${gradientId})`}
            stroke={frameColor}
            strokeWidth={hero ? "20" : "16"}
          />
        ) : (
          <path
            d="M665 125 Q575 95 445 122 Q420 144 440 228 Q452 268 508 272 L600 266 Q652 261 660 216 Z"
            fill={`url(#${gradientId})`}
            stroke={frameColor}
            strokeWidth={hero ? "20" : "16"}
            strokeLinejoin="round"
          />
        )}

        {/* Ponte Central Anatômica */}
        <path
          d="M318 146 Q380 115 442 146"
          stroke={frameColor}
          strokeWidth={hero ? "16" : "13"}
          fill="none"
          strokeLinecap="round"
        />

        {/* Linha de Brilho Especular do Acetato */}
        <path
          d="M115 132 Q195 110 300 130 M460 130 Q565 110 645 132"
          stroke="#f8fafc"
          strokeWidth="3.5"
          fill="none"
          opacity="0.75"
          strokeLinecap="round"
        />

        {/* Reflexo Diagonal da Luz Azul nas Lentes */}
        <path
          d="M140 150 L200 240 M480 150 L540 240"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          fill="none"
          opacity="0.4"
        />

        {/* Rebites Dourados Metálicos da Charneira (Assinatura Ventara) */}
        <circle cx="114" cy="132" r="3" fill="#FFD62E" />
        <circle cx="122" cy="132" r="3" fill="#FFD62E" />
        <circle cx="646" cy="132" r="3" fill="#FFD62E" />
        <circle cx="638" cy="132" r="3" fill="#FFD62E" />
      </g>
    </svg>
  );
});
