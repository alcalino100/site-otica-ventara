import React from "react";

/**
 * Ilustrações pequenas (SVG) usadas no comparador de medidas:
 * mostram onde fica cada uma das 3 medidas (lente, ponte e haste).
 * Decorativas (aria-hidden): o texto ao lado já explica a medida.
 */

interface IllustrationProps {
  /** Cor da seta de medida (hex). */
  accent: string;
  className?: string;
}

const FRAME = "#0F172A";
const LENS_FILL = "#E0ECFF";

function Arrow({ x1, x2, y, accent }: { x1: number; x2: number; y: number; accent: string }) {
  return (
    <g stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x1 + 4} ${y - 3.5} L${x1} ${y} L${x1 + 4} ${y + 3.5}`} />
      <path d={`M${x2 - 4} ${y - 3.5} L${x2} ${y} L${x2 - 4} ${y + 3.5}`} />
    </g>
  );
}

/** Armação de frente com a largura de uma lente em destaque. */
export function LensIllustration({ accent, className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 64" className={className} fill="none" aria-hidden="true" focusable="false">
      <rect x="6" y="24" width="34" height="26" rx="11" fill={LENS_FILL} stroke={FRAME} strokeWidth="3" />
      <rect x="56" y="24" width="34" height="26" rx="11" fill={LENS_FILL} stroke={FRAME} strokeWidth="3" />
      <path d="M40 33 C45 28 51 28 56 33" stroke={FRAME} strokeWidth="3" strokeLinecap="round" />
      <path d="M6 14 V22 M40 14 V22" stroke={accent} strokeWidth="1.5" strokeDasharray="2 2" />
      <Arrow x1={6} x2={40} y={14} accent={accent} />
    </svg>
  );
}

/** Aproximação da ponte nasal, com o espaço entre as lentes em destaque. */
export function BridgeIllustration({ accent, className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 64" className={className} fill="none" aria-hidden="true" focusable="false">
      <path d="M2 16 H26 Q37 16 37 27 V44 Q37 52 29 52 H2" fill={LENS_FILL} stroke={FRAME} strokeWidth="3" strokeLinejoin="round" />
      <path d="M94 16 H70 Q59 16 59 27 V44 Q59 52 67 52 H94" fill={LENS_FILL} stroke={FRAME} strokeWidth="3" strokeLinejoin="round" />
      <path d="M37 29 C43 20 53 20 59 29" stroke={FRAME} strokeWidth="4" strokeLinecap="round" />
      <path d="M37 34 V44 M59 34 V44" stroke={accent} strokeWidth="1.5" strokeDasharray="2 2" />
      <Arrow x1={37} x2={59} y={40} accent={accent} />
    </svg>
  );
}

/** Haste vista de lado, com o comprimento em destaque. */
export function TempleIllustration({ accent, className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 64" className={className} fill="none" aria-hidden="true" focusable="false">
      <path d="M6 12 H14 L12 38 H4 Z" fill={LENS_FILL} stroke={FRAME} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 18 H68 Q82 18 87 30 L91 42" stroke={FRAME} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="18" r="2.5" fill="#FBBF24" />
      <path d="M14 44 V56 M91 46 V56" stroke={accent} strokeWidth="1.5" strokeDasharray="2 2" />
      <Arrow x1={14} x2={91} y={52} accent={accent} />
    </svg>
  );
}
