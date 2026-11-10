/**
 * Gerenciador de Seleção / Carrinho e Integração WhatsApp da Ótica Ventara
 * Persistência automática em localStorage com expiração de 7 dias e formatação de mensagens comerciais.
 */

import { DEFAULT_SITE_URL, buildWhatsAppUrl } from "@/lib/whatsapp";

export interface CartProduct {
  id: string; // Ex: `${productId}-${variantId || 'default'}`
  productId?: string;
  variantId?: string;
  sku?: string;
  name: string;
  slug: string;
  category: string;
  color: string;
  colorHex?: string;
  priceInCents: number;
  originalPriceInCents?: number | null;
  imageUrl?: string;
  quantity?: number;
  stockQuantity?: number;
  addedAt?: number; // timestamp em ms
  isOutOfStock?: boolean;
  priceChangedMessage?: string;
}

const CART_STORAGE_KEY = "ventara_cart_items_v2";
const LEGACY_STORAGE_KEY = "ventara_selected_frames_v1";
const CART_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function getStoredCart(): CartProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];

    const parsed: any[] = JSON.parse(raw);
    const now = Date.now();

    // Filtra itens não expirados e normaliza estrutura
    const validItems: CartProduct[] = parsed
      .filter((it) => {
        if (!it.addedAt) return true;
        return now - it.addedAt < CART_EXPIRATION_MS;
      })
      .map((it) => ({
        id: it.id || `${it.slug || it.name}-${it.color || "padrao"}`,
        productId: it.productId || it.id?.split("-")[0] || "",
        variantId: it.variantId || undefined,
        sku: it.sku || "",
        name: it.name || "Armação Ventara",
        slug: it.slug || "",
        category: it.category || "Armação",
        color: it.color || "Padrão",
        colorHex: it.colorHex || "#1e293b",
        priceInCents: typeof it.priceInCents === "number" ? it.priceInCents : (it.price || 0) * 100,
        originalPriceInCents: it.originalPriceInCents ?? null,
        imageUrl: it.imageUrl || "",
        quantity: Math.max(1, Number(it.quantity || 1)),
        stockQuantity: typeof it.stockQuantity === "number" ? it.stockQuantity : 10,
        addedAt: it.addedAt || now,
        isOutOfStock: Boolean(it.isOutOfStock),
        priceChangedMessage: it.priceChangedMessage || undefined,
      }));

    return validItems;
  } catch (err) {
    console.warn("Erro ao ler carrinho do localStorage:", err);
    return [];
  }
}

export function saveStoredCart(items: CartProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const prepared = items.map((it) => ({
      ...it,
      addedAt: it.addedAt || now,
      quantity: Math.max(1, it.quantity || 1),
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(prepared));
    // Sincroniza também com a chave legada para retrocompatibilidade
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(prepared));
  } catch (err) {
    console.warn("Erro ao salvar carrinho no localStorage:", err);
  }
}

export function addToCart(product: Omit<CartProduct, "addedAt">): CartProduct[] {
  const current = getStoredCart();
  const existingIdx = current.findIndex((item) => item.id === product.id);

  let updated: CartProduct[];
  if (existingIdx >= 0) {
    updated = [...current];
    const maxStock = product.stockQuantity || 10;
    const currentQty = updated[existingIdx].quantity || 1;
    const addQty = product.quantity || 1;
    const newQty = Math.min(maxStock, currentQty + addQty);
    updated[existingIdx] = {
      ...updated[existingIdx],
      quantity: newQty,
      addedAt: Date.now(),
      priceInCents: product.priceInCents,
      imageUrl: product.imageUrl || updated[existingIdx].imageUrl,
    };
  } else {
    updated = [
      ...current,
      {
        ...product,
        quantity: Math.max(1, product.quantity || 1),
        addedAt: Date.now(),
      },
    ];
  }

  saveStoredCart(updated);
  return updated;
}

export function updateCartQuantity(itemId: string, newQuantity: number): CartProduct[] {
  const current = getStoredCart();
  const updated = current.map((item) => {
    if (item.id === itemId) {
      const maxStock = item.stockQuantity || 10;
      const validQty = Math.max(1, Math.min(maxStock, newQuantity));
      return { ...item, quantity: validQty };
    }
    return item;
  });

  saveStoredCart(updated);
  return updated;
}

export function removeFromCart(itemId: string): { updatedCart: CartProduct[]; removedItem: CartProduct | null } {
  const current = getStoredCart();
  const removedItem = current.find((it) => it.id === itemId) || null;
  const updatedCart = current.filter((it) => it.id !== itemId);
  saveStoredCart(updatedCart);
  return { updatedCart, removedItem };
}

export function restoreCartItem(item: CartProduct): CartProduct[] {
  const current = getStoredCart();
  const exists = current.some((it) => it.id === item.id);
  const updated = exists ? current : [...current, item];
  saveStoredCart(updated);
  return updated;
}

export function clearCart(): void {
  saveStoredCart([]);
}

export function buildWhatsAppProductUrl(productName: string, productSlug: string): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;
  const productLink = `${siteUrl}/produto/${productSlug}`;

  const message = `Olá equipe da Ótica Ventara! Gostaria de consultar a disponibilidade e valores de lentes para a armação:\n\n👓 *${productName}*\n🔗 Link: ${productLink}\n\nPodem me orientar sobre as opções de lentes para a minha receita?`;

  return buildWhatsAppUrl(message);
}

export function buildWhatsAppCartUrl(
  items: CartProduct[],
  customerInfo?: { name?: string; phone?: string; deliveryType?: string; address?: string }
): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;

  if (items.length === 0) {
    const emptyMsg = `Olá! Gostaria de saber mais sobre as armações e lentes da Ótica Ventara em Araçatuba.`;
    return buildWhatsAppUrl(emptyMsg);
  }

  const itemsList = items
    .map((item, idx) => {
      const qty = item.quantity || 1;
      const qtyStr = qty > 1 ? ` (${qty}x)` : "";
      const priceStr = item.priceInCents
        ? ` - ${(item.priceInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
        : "";
      const skuStr = item.sku ? ` [SKU: ${item.sku}]` : "";
      return `${idx + 1}. *${item.name}*${qtyStr}\n   • Cor: ${item.color}${skuStr}${priceStr}\n   • Link: ${siteUrl}/produto/${item.slug}`;
    })
    .join("\n\n");

  const totalCents = items.reduce(
    (acc, it) => acc + (it.priceInCents || 0) * (it.quantity || 1),
    0
  );

  const totalSummary =
    totalCents > 0
      ? `\n\n💰 *Total da Seleção:* ${(totalCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })} (ou até 10x de ${((totalCents / 10) / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })} sem juros)`
      : "";

  let customerSection = "";
  if (customerInfo) {
    customerSection = `\n\n👤 *Dados do Cliente:*\n• Nome: ${customerInfo.name || "Não informado"}`;
    if (customerInfo.deliveryType) {
      customerSection += `\n• Modalidade: ${customerInfo.deliveryType === "store_pickup" ? "Retirada no Centro de Araçatuba" : "Envio com entrega"}`;
    }
    if (customerInfo.address) {
      customerSection += `\n• Endereço: ${customerInfo.address}`;
    }
  }

  const message =
    `Olá equipe da Ótica Ventara! Gostaria de fechar meu pedido com a seleção abaixo:\n\n` +
    `${itemsList}${totalSummary}${customerSection}\n\n` +
    `Podem confirmar a disponibilidade e os dados para pagamento?`;

  return buildWhatsAppUrl(message);
}
