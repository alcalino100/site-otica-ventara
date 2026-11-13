/**
 * Posição da foto dentro do card (equivale ao `object-position` do CSS, em %).
 * 0% = borda esquerda/superior, 100% = borda direita/inferior.
 * Sem valor (null/undefined) = enquadramento automático do site.
 */
export interface ImageFocus {
  focus_x?: number | null;
  focus_y?: number | null;
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
export function focusForSave(image?: ImageFocus | null): { focus_x: number; focus_y: number } | null {
  const x = normalizeFocusValue(image?.focus_x);
  const y = normalizeFocusValue(image?.focus_y);
  return x === null || y === null ? null : { focus_x: x, focus_y: y };
}
