/**
 * Utilitário para cálculo e validação de contraste de cores segundo as diretrizes WCAG 2.1.
 * W3C Recommendation: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

export interface ContrastResult {
  ratio: number;
  formattedRatio: string;
  passesAA: boolean; // >= 4.5:1 (texto normal)
  passesAALarge: boolean; // >= 3.0:1 (texto grande >= 18pt ou 14pt bold, ou ícones e bordas)
  passesAAA: boolean; // >= 7.0:1
  level: "AAA" | "AA" | "AA-Large" | "FAIL";
  scoreText: string;
}

/**
 * Converte um canal sRGB (0-255) em luminância linear sRGB
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Normaliza qualquer cor Hex (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) para componentes RGB [0-255]
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") return null;

  let clean = hex.trim().replace(/^#/, "");

  if (clean.length === 3 || clean.length === 4) {
    clean = clean
      .split("")
      .slice(0, 3)
      .map((ch) => ch + ch)
      .join("");
  }

  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }

  return null;
}

/**
 * Calcula a luminância relativa de uma cor RGB (0.0 a 1.0)
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula a taxa de contraste (1:1 até 21:1) entre duas cores Hex
 */
export function calculateContrast(foregroundHex: string, backgroundHex: string): ContrastResult {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);

  if (!fg || !bg) {
    return {
      ratio: 1,
      formattedRatio: "1.0:1",
      passesAA: false,
      passesAALarge: false,
      passesAAA: false,
      level: "FAIL",
      scoreText: "Cor inválida",
    };
  }

  const lumFg = getRelativeLuminance(fg);
  const lumBg = getRelativeLuminance(bg);

  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  const roundedRatio = Math.round(ratio * 100) / 100;
  const formattedRatio = `${roundedRatio.toFixed(2)}:1`;

  const passesAAA = ratio >= 7.0;
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3.0;

  let level: "AAA" | "AA" | "AA-Large" | "FAIL" = "FAIL";
  let scoreText = "Reprovado (WCAG)";

  if (passesAAA) {
    level = "AAA";
    scoreText = "Excelente (AAA)";
  } else if (passesAA) {
    level = "AA";
    scoreText = "Aprovado (AA)";
  } else if (passesAALarge) {
    level = "AA-Large";
    scoreText = "Apenas Texto Grande (>= 18pt)";
  }

  return {
    ratio: roundedRatio,
    formattedRatio,
    passesAA,
    passesAALarge,
    passesAAA,
    level,
    scoreText,
  };
}
