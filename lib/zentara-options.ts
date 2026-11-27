/**
 * Cartões de compra das lentes Zentara (/zentara).
 * Tudo é editável pelo painel em /admin/zentara; estes valores são o padrão
 * usado enquanto nada foi salvo.
 */
export interface ZentaraOption {
  id: string;
  name: string;
  /** Índice de refração, usado em ids de teste e na mensagem do WhatsApp. */
  index: string;
  tagline: string;
  /** Especificações exibidas em lista no cartão. */
  highlights: string[];
  /** Selo preto no canto da foto. */
  badge: string;
  imageUrl: string;
  /** Preço promocional (centavos). null = "Consulte o valor". */
  priceCents: number | null;
  /** Preço antigo riscado (centavos). */
  oldPriceCents: number | null;
  featured?: boolean;
  active: boolean;
}

export const ZENTARA_DEFAULT_IMAGE = "/images/zentara/caixa-zentara.jpg";
const SPECS = ["Antirreflexo premium", "Tratamento hidrofóbico", "12 meses de garantia"];

export const ZENTARA_OPTIONS: ZentaraOption[] = [
  { id: "zentara-156", name: "Zentara 1.56", index: "1.56", tagline: "Equilíbrio entre leveza e custo-benefício", highlights: SPECS, badge: "Zentara", imageUrl: ZENTARA_DEFAULT_IMAGE, priceCents: null, oldPriceCents: null, active: true },
  { id: "zentara-167", name: "Zentara 1.67", index: "1.67", tagline: "Mais fina e leve para graus médios e altos", highlights: SPECS, badge: "Zentara", imageUrl: ZENTARA_DEFAULT_IMAGE, priceCents: null, oldPriceCents: null, active: true },
  { id: "zentara-174", name: "Zentara 1.74", index: "1.74", tagline: "Ultrafina: a lente mais fina para graus elevados", highlights: SPECS, badge: "Zentara", imageUrl: ZENTARA_DEFAULT_IMAGE, priceCents: null, oldPriceCents: null, featured: true, active: true },
];

export const formatBRL = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Converte "299,90" / "R$ 1.299,90" / "299.9" em centavos; vazio vira null; inválido vira undefined. */
export function parseBRLToCents(input: string): number | null | undefined {
  if (!input.trim()) return null;
  const t = input.replace(/[^\d.,]/g, "").trim();
  if (!/\d/.test(t)) return undefined;
  const n = t.includes(",") ? Number(t.replace(/\./g, "").replace(",", ".")) : Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return undefined;
  return Math.round(n * 100);
}

const str = (v: unknown, max: number, fb: string) => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const cents = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 10_000_000 ? Math.round(v) : null);
const safeUrl = (v: unknown, fb: string) => (typeof v === "string" && /^(https:\/\/|\/(?!\/))[^\s"'<>]{1,500}$/.test(v.trim()) ? v.trim() : fb);

/** Junta o que foi salvo com o padrão, validando cada campo (o salvo nunca quebra a página). */
export function sanitizeZentaraOptions(raw: unknown): ZentaraOption[] {
  const list = Array.isArray(raw) ? raw : [];
  return ZENTARA_OPTIONS.map((d) => {
    const s = (list.find((x) => x && typeof x === "object" && (x as any).id === d.id) || {}) as Record<string, unknown>;
    const highlights = Array.isArray(s.highlights)
      ? s.highlights.filter((h): h is string => typeof h === "string").map((h) => h.trim().slice(0, 80)).filter(Boolean).slice(0, 8)
      : d.highlights;
    return {
      ...d,
      name: str(s.name, 60, d.name) || d.name,
      tagline: str(s.tagline, 120, d.tagline),
      highlights,
      badge: str(s.badge, 24, d.badge),
      imageUrl: safeUrl(s.imageUrl, d.imageUrl),
      priceCents: s.priceCents === undefined ? d.priceCents : cents(s.priceCents),
      oldPriceCents: s.oldPriceCents === undefined ? d.oldPriceCents : cents(s.oldPriceCents),
      active: typeof s.active === "boolean" ? s.active : d.active,
    };
  });
}
