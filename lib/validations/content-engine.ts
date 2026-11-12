import { z } from "zod";

/**
 * Validação segura de URLs para campos de link do CMS.
 * Permite apenas https, mailto, tel, wa.me e caminhos relativos internos.
 * Bloqueia expressamente javascript:, data:, vbscript: e outros esquemas perigosos.
 */
export function isValidSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Caminhos relativos do site (ex: /armacoes, /lentes)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  // Links do WhatsApp
  if (trimmed.startsWith("wa.me/") || trimmed.startsWith("https://wa.me/")) {
    return true;
  }

  // Links de e-mail e telefone
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return true;
  }

  // Links externos seguros (HTTPS ou localhost para desenvolvimento local)
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" ||
      (parsed.hostname === "localhost" && parsed.protocol === "http:")
    );
  } catch {
    return false;
  }
}

/**
 * Sanitiza texto simples e texto rico, removendo injeções de script ou tags perigosas.
 */
export function sanitizeRichText(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Remove tags perigosas e manipuladores de eventos
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "");
}

/**
 * Schema Zod para campo de imagem do CMS com Alt obrigatório.
 */
export const ContentImageSchema = z.object({
  url: z.string().min(1, "A URL da imagem é obrigatória"),
  alt: z.string().min(1, "O texto alternativo (alt) é obrigatório para acessibilidade e SEO"),
  focalPoint: z
    .object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
});

/**
 * Schema Zod para campo de link.
 */
export const ContentLinkSchema = z.object({
  url: z
    .string()
    .min(1, "A URL é obrigatória")
    .refine(isValidSafeUrl, {
      message: "URL inválida. Permitido apenas caminhos relativos (/exemplo), https://, wa.me, mailto: ou tel:",
    }),
  label: z.string().optional(),
  targetBlank: z.boolean().optional(),
});

/**
 * Schema para ação de Salvar Rascunho.
 */
export const SaveContentDraftSchema = z.object({
  page: z.string().min(1, "O identificador da página é obrigatório"),
  values: z.record(z.string(), z.any()),
  sectionsOrder: z.array(z.string()).optional(),
  hiddenSections: z.array(z.string()).optional(),
});

/**
 * Schema para ação de Publicar Conteúdo.
 */
export const PublishContentSchema = z.object({
  page: z.string().min(1, "O identificador da página é obrigatório"),
  label: z.string().min(2, "O rótulo da versão é obrigatório (mínimo 2 caracteres)").max(100),
  summary: z.string().min(3, "O resumo da alteração é obrigatório (mínimo 3 caracteres)").max(500),
  values: z.record(z.string(), z.any()).optional(),
  sectionsOrder: z.array(z.string()).optional(),
  hiddenSections: z.array(z.string()).optional(),
});

/**
 * Schema para ação de Restaurar Histórico.
 */
export const RestoreContentHistorySchema = z.object({
  page: z.string().min(1, "O identificador da página é obrigatório"),
  historyId: z.string().uuid("ID de versão inválido"),
});
