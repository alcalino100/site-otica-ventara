"use client";

import React, { useMemo } from "react";
import { WheelSegment } from "@/types/promotion-wheel";

interface PromotionWheelCanvasProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  targetSegmentIndex: number | null;
  pointerColor?: string;
  borderColor?: string;
  onSpinEnd?: () => void;
  size?: number;
}

export function PromotionWheelCanvas({
  segments,
  isSpinning,
  targetSegmentIndex,
  pointerColor = "#E8C765",
  borderColor = "rgba(232, 199, 101, 0.4)",
  onSpinEnd,
  size = 320,
}: PromotionWheelCanvasProps) {
  const total = segments.length;
  const sliceAngle = 360 / total;
  const radius = 140;
  const center = 160;

  // Calcula o ângulo de rotação final para alinhar o segmento vencedor ao ponteiro fixo no topo
  const targetRotation = useMemo(() => {
    if (targetSegmentIndex === null || targetSegmentIndex < 0) return 0;
    // O ponteiro fica no topo (0° ou 270° em coordenadas polares)
    // Cada segmento i começa em i * sliceAngle e seu centro está em (i + 0.5) * sliceAngle
    const sliceCenterAngle = targetSegmentIndex * sliceAngle + sliceAngle / 2;
    // Realiza 6 voltas completas (2160°) e subtrai o centro do segmento para posicioná-lo no topo
    const fullSpins = 360 * 6;
    return fullSpins + (360 - sliceCenterAngle);
  }, [targetSegmentIndex, sliceAngle]);

  // Gera o caminho SVG em arco para cada fatia
  const slices = useMemo(() => {
    return segments.map((seg, idx) => {
      // Ângulo inicial e final da fatia (em radianos)
      // Desloca 90° (-Math.PI / 2) para que o ângulo 0 fique no topo (12 horas)
      const startDeg = idx * sliceAngle - 90;
      const endDeg = (idx + 1) * sliceAngle - 90;
      const startRad = (startDeg * Math.PI) / 180;
      const endRad = (endDeg * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Ângulo para rotação do texto no meio da fatia
      const midDeg = idx * sliceAngle + sliceAngle / 2;

      return {
        seg,
        pathData,
        midDeg,
        idx,
      };
    });
  }, [segments, sliceAngle, radius, center]);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Roleta de benefícios Óticas Ventara"
    >
      {/* Ponteiro Fixo Superior com Acabamento Dourado */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        aria-hidden="true"
      >
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
          {/* Corpo do ponteiro */}
          <path
            d="M17 40L6 14C4 9.5 7.5 4 12.5 4H21.5C26.5 4 30 9.5 28 14L17 40Z"
            fill={pointerColor}
            stroke="#06121C"
            strokeWidth="2"
          />
          {/* Brilho interno do ponteiro */}
          <circle cx="17" cy="14" r="5" fill="#06121C" />
          <circle cx="17" cy="14" r="2.5" fill={pointerColor} />
        </svg>
      </div>

      {/* Anel Externo Dourado com Luz Suave */}
      <div
        className="absolute inset-0 rounded-full border-4 shadow-[0_0_35px_rgba(232,199,101,0.25)] pointer-events-none z-20"
        style={{ borderColor }}
      />

      {/* Roda Giratória em SVG */}
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full transition-transform"
        style={{
          transform: isSpinning ? `rotate(${targetRotation}deg)` : "rotate(0deg)",
          transitionDuration: isSpinning ? "5.2s" : "0s",
          transitionTimingFunction: "cubic-bezier(0.12, 0.8, 0.25, 1)", // Desaceleração física suave
        }}
        onTransitionEnd={() => {
          if (isSpinning && onSpinEnd) {
            onSpinEnd();
          }
        }}
      >
        <defs>
          {/* Filtro de sombra suave interna */}
          <radialGradient id="wheelCenterShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06121C" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#10283B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8C765" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Círculo de fundo */}
        <circle cx={center} cy={center} r={radius + 4} fill="#06121C" stroke={borderColor} strokeWidth="2" />

        {/* Fatias da Roleta */}
        <g>
          {slices.map(({ seg, pathData, midDeg, idx }) => (
            <g key={seg.id || idx}>
              <path
                d={pathData}
                fill={seg.color}
                stroke="rgba(232, 199, 101, 0.2)"
                strokeWidth="1.2"
              />

              {/* Rótulo do Segmento posicionado e rotacionado radialmente */}
              <g transform={`rotate(${midDeg} ${center} ${center})`}>
                <text
                  x={center}
                  y={center - radius + 38}
                  fill={seg.text_color || "#F5F5F2"}
                  fontSize={total > 8 ? "11" : "12.5"}
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  textAnchor="middle"
                  transform={`rotate(90 ${center} ${center - radius + 38})`}
                  style={{ letterSpacing: "0.5px" }}
                >
                  {seg.label}
                </text>

                {seg.sublabel && (
                  <text
                    x={center}
                    y={center - radius + 52}
                    fill={seg.text_color || "#F5F5F2"}
                    opacity="0.8"
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    textAnchor="middle"
                    transform={`rotate(90 ${center} ${center - radius + 52})`}
                  >
                    {seg.sublabel}
                  </text>
                )}
              </g>
            </g>
          ))}
        </g>

        {/* Centro Nobre da Roleta com Logo Ventara / Monograma */}
        <circle cx={center} cy={center} r="36" fill="#06121C" stroke={pointerColor} strokeWidth="2.5" />
        <circle cx={center} cy={center} r="30" fill="#10283B" />
        <circle cx={center} cy={center} r="18" fill="url(#wheelCenterShadow)" />

        {/* Monograma "V" Ventara no centro */}
        <text
          x={center}
          y={center + 5}
          fill={pointerColor}
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1px"
        >
          V
        </text>
      </svg>
    </div>
  );
}
