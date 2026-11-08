/**
 * Gerenciador de Seleção / Carrinho e Integração WhatsApp
 * Persistência automática em localStorage e formatação de mensagens comerciais.
 */

import { DEFAULT_WHATSAPP_PHONE, DEFAULT_SITE_URL, buildWhatsAppUrl } from "@/lib/whatsapp";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  color: string;
  priceInCents?: number;
  imageUrl?: string;
}

const CART_STORAGE_KEY = "ventara_selected_frames_v1";

export function getStoredCart(): CartProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Erro ao ler carrinho do localStorage:", err);
    return [];
  }
}

export function saveStoredCart(items: CartProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Erro ao salvar carrinho no localStorage:", err);
  }
}

export function buildWhatsAppProductUrl(productName: string, productSlug: string): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;
  const productLink = `${siteUrl}/produto/${productSlug}`;

  const message = `Olá equipe da Ótica Ventara! Gostaria de consultar a disponibilidade e valores de lentes para a armação:\n\n👓 *${productName}*\n🔗 Link: ${productLink}\n\nPodem me orientar sobre as opções de lentes para a minha receita?`;

  return buildWhatsAppUrl(message);
}

export function buildWhatsAppCartUrl(items: CartProduct[]): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;

  if (items.length === 0) {
    const emptyMsg = `Olá! Gostaria de saber mais sobre as armações e lentes da Ótica Ventara em Araçatuba.`;
    return buildWhatsAppUrl(emptyMsg);
  }

  const itemsList = items
    .map(
      (item, idx) => {
        const priceStr = item.priceInCents
          ? ` - ${(item.priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
          : "";
        return `${idx + 1}. *${item.name}* (${item.category} · ${item.color}${priceStr})\n   ${siteUrl}/produto/${item.slug}`;
      }
    )
    .join("\n\n");

  const totalCents = items.reduce((acc, it) => acc + (it.priceInCents || 0), 0);
  const totalSummary =
    totalCents > 0
      ? `\n\n💰 *Total estimado da seleção:* ${(totalCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })} (em até 10x sem juros)`
      : "";

  const message = `Olá equipe da Ótica Ventara! Fiz uma seleção de armações no site e gostaria de atendimento:\n\n${itemsList}${totalSummary}\n\nGostaria de verificar a disponibilidade e consultar opções de lentes para a minha receita.`;

  return buildWhatsAppUrl(message);
}
