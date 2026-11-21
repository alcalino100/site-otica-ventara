import crypto from "crypto";

/**
 * Validação de Assinatura Criptográfica Webhook Mercado Pago (x-signature)
 */
export function verifyMercadoPagoWebhookSignature(
  xSignatureHeader: string | null,
  dataId: string | null,
  secret: string | null,
  requestId?: string | null
): boolean {
  // Sem secret não há como validar a assinatura; quem chama deve confirmar o pagamento na API do MP.
  if (!secret) return true;
  if (!xSignatureHeader || !dataId) return false;

  try {
    // Formato do x-signature: ts=1700000000,v1=5349348923...
    const parts = xSignatureHeader.split(",").reduce((acc, part) => {
      const [key, val] = part.split("=");
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    }, {} as Record<string, string>);

    const ts = parts["ts"];
    const v1 = parts["v1"];

    if (!ts || !v1) return false;

    // Template oficial do MP: partes ausentes (ex.: request-id) são omitidas do manifesto.
    const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
    const manifest = `${id ? `id:${id};` : ""}${requestId ? `request-id:${requestId};` : ""}ts:${ts};`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(computed));
  } catch {
    return false;
  }
}

