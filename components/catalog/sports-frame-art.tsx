import React, { memo } from "react";

export type SportsLensColor = "sapphire" | "fire" | "smoke" | "ruby";
export type SportsFrameColor = "black" | "white" | "matte-black";

interface SportsFrameArtProps {
  lensColor?: SportsLensColor;
  frameColor?: SportsFrameColor;
  className?: string;
}

export const SportsFrameArt = memo(function SportsFrameArt({
  lensColor = "sapphire",
  frameColor = "black",
  className = "",
}: SportsFrameArtProps) {
  const isWhite = frameColor === "white";
  const frameFill = isWhite ? "#f8fafc" : "#0c131d";
  const frameStroke = isWhite ? "#cbd5e1" : "#1e293b";
  const frameHighlight = isWhite ? "#ffffff" : "#2d3748";

  // Lens gradient definitions
  const lensGradients: Record<SportsLensColor, { stops: { offset: string; color: string; opacity?: string }[] }> = {
    sapphire: {
      stops: [
        { offset: "0%", color: "#38bdf8", opacity: "0.95" },
        { offset: "30%", color: "#0284c7", opacity: "0.9" },
        { offset: "70%", color: "#2563eb", opacity: "0.95" },
        { offset: "100%", color: "#1e1b4b", opacity: "0.9" },
      ],
    },
    fire: {
      stops: [
        { offset: "0%", color: "#facc15", opacity: "0.95" },
        { offset: "35%", color: "#ea580c", opacity: "0.9" },
        { offset: "75%", color: "#dc2626", opacity: "0.95" },
        { offset: "100%", color: "#7f1d1d", opacity: "0.9" },
      ],
    },
    smoke: {
      stops: [
        { offset: "0%", color: "#475569", opacity: "0.9" },
        { offset: "40%", color: "#1e293b", opacity: "0.95" },
        { offset: "80%", color: "#0f172a", opacity: "0.98" },
        { offset: "100%", color: "#020617", opacity: "0.98" },
      ],
    },
    ruby: {
      stops: [
        { offset: "0%", color: "#fb7185", opacity: "0.95" },
        { offset: "40%", color: "#e11d48", opacity: "0.9" },
        { offset: "80%", color: "#be123c", opacity: "0.95" },
        { offset: "100%", color: "#4c0519", opacity: "0.9" },
      ],
    },
  };

  const activeGradient = lensGradients[lensColor] || lensGradients.sapphire;
  const gradId = `sportsLens_${lensColor}`;

  return (
    <svg
      className={`sports-frame-art ${className}`}
      viewBox="0 0 800 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Óculos esportivo Ventara ${lensColor}`}
    >
      <defs>
        {/* Dynamic Lens Gradient */}
        <linearGradient id={gradId} x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          {activeGradient.stops.map((st, i) => (
            <stop key={i} offset={st.offset} stopColor={st.color} stopOpacity={st.opacity || "1"} />
          ))}
        </linearGradient>

        {/* Specular curved reflection across the shield lens */}
        <linearGradient id="shieldGloss" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>

        {/* Drop shadow */}
        <filter id="sportsShadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="16" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter="url(#sportsShadow)">
        {/* Left Temple (Behind) */}
        <path
          d="M170 145 C130 140 70 155 30 180 C20 186 20 196 32 194 C65 186 125 178 168 175 Z"
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="3"
        />

        {/* Right Temple (Foreground) */}
        <path
          d="M625 145 L760 195 C775 200 785 208 775 214 C765 220 740 216 715 210 L620 180 Z"
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="3"
        />

        {/* Emblem on Right Temple */}
        <ellipse cx="700" cy="192" rx="14" ry="7" fill="none" stroke="#FFD62E" strokeWidth="2.5" />

        {/* Panoramic Shield Single Curved Lens */}
        <path
          d="M175 140 C280 132 520 132 625 140 C635 150 645 220 635 270 C625 310 560 330 460 325 C435 323 420 280 400 280 C380 280 365 323 340 325 C240 330 175 310 165 270 C155 220 165 150 175 140 Z"
          fill={`url(#${gradId})`}
          stroke="#000000"
          strokeWidth="3"
        />

        {/* Lens Gloss & Horizon Reflection Highlight */}
        <path
          d="M175 140 C280 132 520 132 625 140 C635 150 645 220 635 270 C625 310 560 330 460 325 C435 323 420 280 400 280 C380 280 365 323 340 325 C240 330 175 310 165 270 C155 220 165 150 175 140 Z"
          fill="url(#shieldGloss)"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Diagonal Light Streak across Visor */}
        <path
          d="M260 140 L380 320 L350 320 L230 140 Z"
          fill="#ffffff"
          opacity="0.12"
        />

        {/* Top Aerodynamic Brow Bar / Frame Chassis */}
        <path
          d="M160 135 C260 120 540 120 640 135 C650 140 648 152 638 155 C540 142 260 142 162 155 C152 152 150 140 160 135 Z"
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="3"
        />

        {/* Top Brow Rim Accent Highlight */}
        <path
          d="M170 136 C270 123 530 123 630 136"
          stroke={frameHighlight}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center Top Vent Cutouts */}
        <rect x="365" y="132" width="22" height="6" rx="3" fill="#000000" opacity="0.75" />
        <rect x="413" y="132" width="22" height="6" rx="3" fill="#000000" opacity="0.75" />

        {/* Aerodynamic Side Wing End-pieces */}
        <path
          d="M152 142 L172 178 L158 185 L144 148 Z"
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="2"
        />
        <path
          d="M648 142 L628 178 L642 185 L656 148 Z"
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="2"
        />

        {/* Ergonomic Nose Bridge Pad (Rubberized) */}
        <path
          d="M375 275 C385 260 415 260 425 275 C420 300 410 315 400 315 C390 315 380 300 375 275 Z"
          fill="#111827"
          stroke="#374151"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
});
