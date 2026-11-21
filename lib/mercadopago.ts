import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
export { verifyMercadoPagoWebhookSignature } from "@/lib/mercadopago-signature";

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
  accessTokenOverride?: string;
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
  environment?: "sandbox" | "production";
  errorMessage?: string;
}

/**
 * Cria cobrança instantânea via Pix na API oficial do Mercado Pago
 */
export async function createMercadoPagoPixPayment(
  input: CreatePixInput
): Promise<PixPaymentResult> {
  const creds = await getMercadoPagoCredentials();
  const rawToken = input.accessTokenOverride || creds.accessToken;
  const token = rawToken
    ? rawToken.trim().replace(/^Bearer\s+/i, "").replace(/["']/g, "")
    : null;

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

  // Limpeza de CPF - só anexa se tiver 11 dígitos para evitar rejeição com zeros
  const cleanDoc = (input.customer.document || "").replace(/\D/g, "");
  const payerPayload: any = {
    email: input.customer.email.trim().toLowerCase(),
    first_name: firstName,
    last_name: lastName,
  };

  if (cleanDoc.length === 11) {
    payerPayload.identification = {
      type: "CPF",
      number: cleanDoc,
    };
  }

  // Validação prévia de credencial
  if (!token || token.length < 15) {
    return {
      paymentId: `MP-ERR-CREDS-${Date.now()}`,
      status: "rejected",
      statusDetail: "unauthorized",
      qrCode: generateMockPixString(input.referenceCode, amountNumber),
      qrCodeBase64: null,
      ticketUrl: undefined,
      expiresAt,
      isMock: true,
      errorMessage:
        "Access Token do Mercado Pago não informado ou incompleto. Configure seu Access Token (iniciado por APP_USR- ou TEST-) no painel para gerar cobranças reais.",
      environment: creds.environment,
    };
  }

  try {
    const idempotencyKey = crypto.randomUUID();
    const payload = {
      transaction_amount: amountNumber,
      description: `Pedido ${input.referenceCode} - Óticas Ventara`,
      payment_method_id: "pix",
      payer: payerPayload,
      notification_url: notificationUrl,
      external_reference: input.referenceCode,
      date_of_expiration: expiresAt,
    };

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
        environment: creds.environment,
      };
    } else {
      let friendlyError =
        data.message ||
        (data.cause && data.cause[0]?.description) ||
        `Recusado pelo Mercado Pago (HTTP ${res.status})`;

      if (
        data.message === "authorization value not present" ||
        res.status === 401 ||
        data.error === "unauthorized"
      ) {
        friendlyError =
          "Credencial de Acesso não autorizada (HTTP 401). O Access Token informado não foi reconhecido pelo Mercado Pago. Verifique se copiou a chave correta da aba 'Credenciais de Produção' ou 'Credenciais de Teste' no painel de desenvolvedores do Mercado Pago.";
      }

      console.warn("Mercado Pago Pix recusou com payload:", data);
      return {
        paymentId: `MP-ERR-${Date.now()}`,
        status: "rejected",
        statusDetail: data.status_detail || data.message || "rejected",
        qrCode: generateMockPixString(input.referenceCode, amountNumber),
        qrCodeBase64: null,
        ticketUrl: undefined,
        expiresAt,
        isMock: true,
        errorMessage: friendlyError,
        environment: creds.environment,
      };
    }
  } catch (err: any) {
    console.error("Erro na chamada Mercado Pago Pix:", err);
    return {
      paymentId: `MP-ERR-${Date.now()}`,
      status: "error",
      statusDetail: err.message,
      qrCode: generateMockPixString(input.referenceCode, amountNumber),
      qrCodeBase64: null,
      ticketUrl: undefined,
      expiresAt,
      isMock: true,
      errorMessage: err.message || "Falha de rede ao conectar com a API do Mercado Pago.",
      environment: creds.environment,
    };
  }
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
  environment?: "sandbox" | "production";
  errorMessage?: string;
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

  if (!token || token.length < 15) {
    return {
      preferenceId: `PREF-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      initPoint: `${siteUrl}/rastreio?ref=${input.referenceCode}&simulated=true`,
      isMock: true,
      environment: creds.environment,
      errorMessage: "Access Token não configurado para processamento de cartões.",
    };
  }

  try {
    const payload = {
      items: mpItems,
      payer: {
        name: firstName,
        surname: lastName,
        email: input.customer.email.trim().toLowerCase(),
        // Só envia telefone/CPF quando válidos (valores falsos podem derrubar o pagamento no antifraude)
        ...(cleanPhone.length >= 10
          ? { phone: { area_code: cleanPhone.slice(0, 2), number: cleanPhone.slice(2) } }
          : {}),
        ...(cleanDoc.length === 11 ? { identification: { type: "CPF", number: cleanDoc } } : {}),
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
        initPoint:
          creds.environment === "sandbox"
            ? data.sandbox_init_point || data.init_point
            : data.init_point,
        sandboxInitPoint: data.sandbox_init_point,
        isMock: false,
        environment: creds.environment,
      };
    } else {
      const errMsg =
        data.message ||
        (data.cause && data.cause[0]?.description) ||
        `Recusado pelo Mercado Pago (HTTP ${res.status})`;

      return {
        preferenceId: `PREF-ERR-${Date.now()}`,
        initPoint: `${siteUrl}/rastreio?ref=${input.referenceCode}&error=rejected`,
        isMock: true,
        environment: creds.environment,
        errorMessage: errMsg,
      };
    }
  } catch (err: any) {
    console.error("Erro ao criar preferência Mercado Pago:", err);
    return {
      preferenceId: `PREF-ERR-${Date.now()}`,
      initPoint: `${siteUrl}/rastreio?ref=${input.referenceCode}&error=network`,
      isMock: true,
      environment: creds.environment,
      errorMessage: err.message || "Erro de rede ao conectar com Mercado Pago.",
    };
  }
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
 * Gera string no padrão Pix Banco Central (EMVCo) estruturada para testes
 */
function generateMockPixString(referenceCode: string, amount: number): string {
  const valStr = amount.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}520400005303986540${valStr}5802BR5914OTICAS VENTARA6009ARACATUBA62070503${referenceCode.slice(0, 10)}6304`;
}

/** Simulações (Pix/cartão de mentira) só em desenvolvimento ou nos testes automatizados — nunca em produção real. */
export function isPaymentMockAllowed(): boolean {
  return Boolean(process.env.PLAYWRIGHT_TEST) || process.env.NODE_ENV === "development";
}
