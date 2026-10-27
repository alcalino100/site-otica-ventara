import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MercadoPagoCredentials {
  accessToken: string | null;
  publicKey: string | null;
  webhookSecret: string | null;
  environment: "sandbox" | "production";
}

/**
 * Recupera as credenciais ativas do Mercado Pago, priorizando:
 * 1. Variáveis de ambiente da Vercel / .env.local
 * 2. Registro payment_settings salvo no Supabase
 */
export async function getMercadoPagoCredentials(): Promise<MercadoPagoCredentials> {
  const envToken =
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    (process.env.PAYMENT_GATEWAY === "mercadopago" ? process.env.PAYMENT_GATEWAY_API_KEY : null) ||
    process.env.PAYMENT_GATEWAY_API_KEY ||
    null;

  const envPublicKey =
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
    process.env.MERCADO_PAGO_PUBLIC_KEY ||
    null;

  const envWebhookSecret =
    process.env.MERCADO_PAGO_WEBHOOK_SECRET ||
    process.env.PAYMENT_WEBHOOK_SECRET ||
    null;

  let dbToken: string | null = null;
  let dbPublicKey: string | null = null;
  let dbWebhookSecret: string | null = null;
  let dbEnvironment: "sandbox" | "production" = "production";

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_settings")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      const val = data.value as any;
      if (val.mercadopago_access_token) dbToken = val.mercadopago_access_token;
      if (val.mercadopago_public_key) dbPublicKey = val.mercadopago_public_key;
      if (val.mercadopago_webhook_secret) dbWebhookSecret = val.mercadopago_webhook_secret;
      if (val.environment === "sandbox" || val.environment === "production") {
        dbEnvironment = val.environment;
      }
    }
  } catch (err) {
    // Falha silenciosa caso banco indisponível
  }

  const activeToken = envToken || dbToken;
  const isSandbox =
    dbEnvironment === "sandbox" ||
    (activeToken?.startsWith("TEST-") ?? false);

  return {
    accessToken: activeToken,
    publicKey: envPublicKey || dbPublicKey,
    webhookSecret: envWebhookSecret || dbWebhookSecret,
    environment: isSandbox ? "sandbox" : "production",
  };
}

/**
 * Testa a conexão com a API do Mercado Pago usando GET /users/me
 */
export async function testMercadoPagoConnection(tokenToTest?: string): Promise<{
  success: boolean;
  user?: {
    id: number;
    nickname: string;
    email: string;
    site_id: string;
    country_id: string;
  };
  error?: string;
}> {
  const token = tokenToTest || (await getMercadoPagoCredentials()).accessToken;

  if (!token) {
    return {
      success: false,
      error: "Nenhum Access Token configurado para o Mercado Pago.",
    };
  }

  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData.message ||
          `Erro HTTP ${res.status}: Credencial inválida ou sem permissão de acesso.`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      user: {
        id: data.id,
        nickname: data.nickname,
        email: data.email,
        site_id: data.site_id,
        country_id: data.country_id,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro de rede ao conectar com a API do Mercado Pago.",
    };
  }
}

export interface CreatePixInput {
  orderId: string;
  referenceCode: string;
  amountInCents: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  notificationUrl?: string;
  expiresInMinutes?: number;
}

export interface PixPaymentResult {
  paymentId: string;
  status: string;
  statusDetail?: string;
  qrCode: string;
  qrCodeBase64: string | null;
  ticketUrl?: string;
  expiresAt: string;
  isMock: boolean;
}

/**
 * Cria cobrança instantânea via Pix na API oficial do Mercado Pago
 */
export async function createMercadoPagoPixPayment(
  input: CreatePixInput
): Promise<PixPaymentResult> {
  const creds = await getMercadoPagoCredentials();
  const token = creds.accessToken;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oticasventara.com.br";
  const notificationUrl =
    input.notificationUrl || `${siteUrl}/api/webhooks/payment`;

  const expiresInMinutes = input.expiresInMinutes || 30;
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
  const amountNumber = Number((input.amountInCents / 100).toFixed(2));

  // Separação de Primeiro Nome e Sobrenome
  const nameParts = input.customer.name.trim().split(" ");
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || "Ventara";

  // Limpeza de CPF
  const cleanDoc = (input.customer.document || "").replace(/\D/g, "");
  const cpfNumber = cleanDoc.length === 11 ? cleanDoc : "00000000000";

  if (token) {
    try {
      const idempotencyKey = crypto.randomUUID();
      const payload = {
        transaction_amount: amountNumber,
        description: `Pedido ${input.referenceCode} - Óticas Ventara`,
        payment_method_id: "pix",
        payer: {
          email: input.customer.email.trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: cpfNumber,
          },
        },
        notification_url: notificationUrl,
        external_reference: input.referenceCode,
        date_of_expiration: expiresAt,
      };

      const res = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "X-Idempotency-Key": idempotencyKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        const qrCode =
          data.point_of_interaction?.transaction_data?.qr_code ||
          data.transaction_details?.transaction_id;
        const qrCodeBase64 =
          data.point_of_interaction?.transaction_data?.qr_code_base64 || null;
        const ticketUrl =
          data.point_of_interaction?.transaction_data?.ticket_url || null;

        return {
          paymentId: String(data.id),
          status: data.status || "pending",
          statusDetail: data.status_detail,
          qrCode: qrCode || generateMockPixString(input.referenceCode, amountNumber),
          qrCodeBase64: qrCodeBase64,
          ticketUrl: ticketUrl,
          expiresAt: data.date_of_expiration || expiresAt,
          isMock: false,
        };
      } else {
        console.warn("Mercado Pago Pix recusou com payload:", data);
      }
    } catch (err) {
      console.error("Erro na chamada Mercado Pago Pix:", err);
    }
  }

  // Fallback seguro em modo simulação / sem chave configurada
  const mockPix = generateMockPixString(input.referenceCode, amountNumber);
  return {
    paymentId: `MP-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    status: "pending",
    statusDetail: "waiting_transfer",
    qrCode: mockPix,
    qrCodeBase64: null,
    ticketUrl: undefined,
    expiresAt,
    isMock: true,
  };
}

export interface CreatePreferenceInput {
  orderId: string;
  referenceCode: string;
  amountInCents: number;
  items: Array<{
    title: string;
    unitPriceInCents: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  notificationUrl?: string;
}

export interface PreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
  isMock: boolean;
}

/**
 * Cria Preferência do Mercado Pago Checkout Pro (Cartão de Crédito em até 10x sem juros)
 */
export async function createMercadoPagoPreference(
  input: CreatePreferenceInput
): Promise<PreferenceResult> {
  const creds = await getMercadoPagoCredentials();
  const token = creds.accessToken;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oticasventara.com.br";
  const notificationUrl =
    input.notificationUrl || `${siteUrl}/api/webhooks/payment`;

  const nameParts = input.customer.name.trim().split(" ");
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || "Ventara";
  const cleanPhone = (input.customer.phone || "").replace(/\D/g, "");
  const cleanDoc = (input.customer.document || "").replace(/\D/g, "");

  const mpItems = input.items.map((it, idx) => ({
    id: `item-${idx + 1}`,
    title: it.title,
    unit_price: Number((it.unitPriceInCents / 100).toFixed(2)),
    quantity: it.quantity,
    currency_id: "BRL",
  }));

  if (token) {
    try {
      const payload = {
        items: mpItems,
        payer: {
          name: firstName,
          surname: lastName,
          email: input.customer.email.trim().toLowerCase(),
          phone: {
            area_code: cleanPhone.slice(0, 2) || "18",
            number: cleanPhone.slice(2) || "996155748",
          },
          identification: {
            type: "CPF",
            number: cleanDoc.length === 11 ? cleanDoc : "00000000000",
          },
        },
        back_urls: {
          success: `${siteUrl}/rastreio?ref=${input.referenceCode}&status=success`,
          pending: `${siteUrl}/rastreio?ref=${input.referenceCode}&status=pending`,
          failure: `${siteUrl}/rastreio?ref=${input.referenceCode}&status=failure`,
        },
        auto_return: "approved",
        notification_url: notificationUrl,
        external_reference: input.referenceCode,
        payment_methods: {
          installments: 10,
        },
      };

      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return {
          preferenceId: data.id,
          initPoint: creds.environment === "sandbox" ? data.sandbox_init_point || data.init_point : data.init_point,
          sandboxInitPoint: data.sandbox_init_point,
          isMock: false,
        };
      }
    } catch (err) {
      console.error("Erro ao criar preferência Mercado Pago:", err);
    }
  }

  // Fallback simulado caso credenciais não configuradas
  return {
    preferenceId: `PREF-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    initPoint: `${siteUrl}/rastreio?ref=${input.referenceCode}&simulated=true`,
    isMock: true,
  };
}

/**
 * Consulta status detalhado de um pagamento no Mercado Pago
 */
export async function getMercadoPagoPayment(paymentId: string | number): Promise<any | null> {
  const creds = await getMercadoPagoCredentials();
  const token = creds.accessToken;

  if (!token) return null;

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago:`, err);
    return null;
  }
}

/**
 * Validação de Assinatura Criptográfica Webhook Mercado Pago (x-signature)
 */
export function verifyMercadoPagoWebhookSignature(
  xSignatureHeader: string | null,
  dataId: string | null,
  secret: string | null
): boolean {
  if (!secret) return true; // Se o lojista não configurou secret, permite processar
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

    const manifest = `id:${dataId};request-id:;ts:${ts};`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(computed));
  } catch {
    return false;
  }
}

/**
 * Gera string no padrão Pix Banco Central (EMVCo) estruturada para testes
 */
function generateMockPixString(referenceCode: string, amount: number): string {
  const valStr = amount.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}520400005303986540${valStr}5802BR5914OTICAS VENTARA6009ARACATUBA62070503${referenceCode.slice(0, 10)}6304`;
}
