// lib/image-url.ts
// Entrega imagens redimensionadas e em formato moderno (WebP/AVIF) pelo otimizador do Next (/_next/image),
// sem trocar os <img> existentes. Larguras precisam estar na lista do Next (deviceSizes + imageSizes).

const ALLOWED_WIDTHS = [64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920] as const;

function pickWidth(w: number): number {
  return ALLOWED_WIDTHS.find((x) => x >= w) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/** Só otimiza imagens raster http(s) ou do próprio site; SVG, data: e blob: seguem como estão. */
export function canOptimize(src?: string | null): src is string {
  if (!src) return false;
  if (/^(data:|blob:)/i.test(src)) return false;
  if (/\.svg(\?|$)/i.test(src)) return false;
  return src.startsWith("/") || /^https?:\/\//i.test(src);
}

export function optimizedSrc(src: string, width: number): string {
  if (!canOptimize(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${pickWidth(width)}&q=75`;
}

/** Props prontas para <img>: src de tamanho médio + srcSet responsivo. Combine com `sizes`. */
export function optimizedImgProps(src: string | null | undefined, widths: number[] = [384, 640, 828, 1080]) {
  if (!canOptimize(src)) return { src: src ?? undefined };
  const sorted = [...widths].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)];
  return {
    src: optimizedSrc(src, mid),
    srcSet: sorted.map((w) => `${optimizedSrc(src, w)} ${pickWidth(w)}w`).join(", "),
  };
}
