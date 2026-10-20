/**
 * Gerenciador de Seleção / Carrinho e Integração WhatsApp
 * Persistência automática em localStorage e formatação de mensagens comerciais.
 */

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
const WHATSAPP_PHONE = "5518996155748";

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
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://otica-ventara-murex.vercel.app";
  const productLink = `${siteUrl}/produto/${productSlug}`;

  const message = `Olá equipe da Ótica Ventara! Gostaria de consultar a disponibilidade e valores de lentes para a armação:\n\n👓 *${productName}*\n🔗 Link: ${productLink}\n\nPodem me orientar sobre as opções de lentes para a minha receita?`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppCartUrl(items: CartProduct[]): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://otica-ventara-murex.vercel.app";

  if (items.length === 0) {
    const emptyMsg = `Olá! Gostaria de saber mais sobre as armações e lentes da Ótica Ventara em Araçatuba.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(emptyMsg)}`;
  }

  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.category} · ${item.color})\n   ${siteUrl}/produto/${item.slug}`
    )
    .join("\n\n");

  const message = `Olá equipe da Ótica Ventara! Fiz uma seleção de armações no site e gostaria de atendimento:\n\n${itemsList}\n\nGostaria de verificar a disponibilidade e consultar opções de lentes para a minha receita.`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
