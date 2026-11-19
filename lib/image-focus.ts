import type React from "react";

/**
 * Posição da foto dentro do card (equivale ao `object-position` do CSS, em %).
 * 0% = borda esquerda/superior, 100% = borda direita/inferior.
 * Sem valor (null/undefined) = enquadramento automático do site.
 */
export interface ImageFocus {
  focus_x?: number | null;
  focus_y?: number | null;
  /** Aproximação ajustada no admin (1 = sem zoom, até 3). */
  focus_zoom?: number | null;
}

export const FOCUS_ZOOM_MIN = 1;
export const FOCUS_ZOOM_MAX = 3;

/** Zoom válido (1–3, 2 casas) ou null quando não houver aproximação (1 ou inválido). */
export function normalizeZoomValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const z = Math.round(Math.min(FOCUS_ZOOM_MAX, Math.max(FOCUS_ZOOM_MIN, n)) * 100) / 100;
  return z <= FOCUS_ZOOM_MIN ? null : z;
}

/**
 * Estilo inline que aplica o ajuste salvo (posição + zoom) numa <img object-cover>.
 * Usa a propriedade CSS `scale` (não mexe em `transform`, então não conflita com hover).
 * A origem do zoom é o próprio ponto de foco, então a foto continua cobrindo a moldura.
 */
export function focusImageStyle(image?: ImageFocus | null): React.CSSProperties | undefined {
  const pos = focusObjectPosition(image);
  const zoom = normalizeZoomValue(image?.focus_zoom);
  if (!pos && !zoom) return undefined;
  const style: React.CSSProperties = {};
  if (pos) style.objectPosition = pos;
  if (zoom) {
    const x = normalizeFocusValue(image?.focus_x) ?? 50;
    const y = normalizeFocusValue(image?.focus_y) ?? 50;
    style.scale = String(zoom);
    style.transformOrigin = `${x}% ${y}%`;
  }
  return style;
}

/** Converte qualquer valor em % válida (0–100, 1 casa) ou null quando não for número. */
export function normalizeFocusValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

/** `object-position` pronto para style inline, ou undefined quando a foto não tem ajuste salvo. */
export function focusObjectPosition(image?: ImageFocus | null): string | undefined {
  const x = normalizeFocusValue(image?.focus_x);
  const y = normalizeFocusValue(image?.focus_y);
  if (x === null || y === null) return undefined;
  return `${x}% ${y}%`;
}

/** Posição a gravar no banco: só vale se X e Y forem válidos juntos, senão volta ao automático. */
export function focusForSave(
  image?: ImageFocus | null
): { focus_x: number; focus_y: number; focus_zoom?: number } | null {
  const x = normalizeFocusValue(image?.focus_x);
  const y = normalizeFocusValue(image?.focus_y);
  if (x === null || y === null) return null;
  const zoom = normalizeZoomValue(image?.focus_zoom);
  return zoom ? { focus_x: x, focus_y: y, focus_zoom: zoom } : { focus_x: x, focus_y: y };
}
