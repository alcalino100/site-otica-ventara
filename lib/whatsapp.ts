/**
 * Utilitários centralizados para WhatsApp da Ótica Ventara
 * Fonte única de verdade para número, higienização e URLs comerciais.
 */

export const DEFAULT_WHATSAPP_PHONE = "5518996155748";
export const DEFAULT_SITE_URL = "https://www.oticasventara.com.br";

/**
 * Higieniza qualquer número de telefone brasileiro para o formato internacional aceito pelo WhatsApp (wa.me)
 * Ex: "(18) 99615-5748" -> "5518996155748"
 */
export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return DEFAULT_WHATSAPP_PHONE;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_PHONE;
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Constrói URL do WhatsApp com mensagem codificada
 */
export function buildWhatsAppUrl(message?: string, phone?: string | null): string {
  const targetPhone = cleanPhoneNumber(phone);
  if (!message || !message.trim()) {
    return `https://wa.me/${targetPhone}`;
  }
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Constrói URL de consulta direta de armação
 */
export function buildProductWhatsAppUrl(
  productName: string,
  productSlug?: string,
  categoryLabel?: string,
  phone?: string | null
): string {
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;
  const link = productSlug ? `${currentOrigin}/produto/${productSlug}` : "";
  const cat = categoryLabel ? ` (${categoryLabel})` : "";

  let message = `Olá! Gostei do modelo "${productName}"${cat} da Ótica Ventara e gostaria de tirar dúvidas sobre valores e lentes para minha receita.`;
  if (link) {
    message += `\n\n🔗 Link: ${link}`;
  }

  return buildWhatsAppUrl(message, phone);
}
