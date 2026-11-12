import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMercadoPagoCredentials,
  testMercadoPagoConnection,
  createMercadoPagoPixPayment,
} from "@/lib/mercadopago";
import { recordPaymentTransaction } from "@/lib/payment-audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const creds = await getMercadoPagoCredentials();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oticasventara.com.br";
    const webhookUrl = `${siteUrl}/api/webhooks/payment`;

    // Mascaramento de segurança para o Access Token
    const maskedToken = creds.accessToken
      ? `${creds.accessToken.slice(0, 10)}...${creds.accessToken.slice(-4)}`
      : null;

    return NextResponse.json({
      gateway: "mercadopago",
      environment: creds.environment,
      has_access_token: Boolean(creds.accessToken),
      masked_access_token: maskedToken,
      mercadopago_public_key: creds.publicKey || "",
      has_webhook_secret: Boolean(creds.webhookSecret),
      webhook_url: webhookUrl,
      pix_enabled: true,
      credit_card_enabled: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao carregar configurações de pagamento." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();

    // 1. Ação especial: Testar Conexão em tempo real
    if (body.action === "test_connection") {
      const testResult = await testMercadoPagoConnection(body.access_token);
      return NextResponse.json(testResult);
    }

    // 2. Ação especial: Gerar PIX de Teste com QR Code
    if (body.action === "generate_test_pix") {
      const creds = await getMercadoPagoCredentials();
      const tokenToUse = body.access_token || creds.accessToken;
      const refCode = `TESTE-${Date.now().toString(36).toUpperCase()}`;

      const pix = await createMercadoPagoPixPayment({
        orderId: `test-${Date.now()}`,
        referenceCode: refCode,
        amountInCents: 100, // R$ 1,00
        customer: {
          name: "Teste Administrador",
          email: "admin@oticasventara.com.br",
          document: "12345678909",
        },
        expiresInMinutes: 15,
        accessTokenOverride: body.access_token ? String(body.access_token).trim() : undefined,
      });

      // Gravação na trilha de auditoria para diagnóstico em tempo real
      await recordPaymentTransaction({
        reference_code: refCode,
        customer_name: "Teste Administrador (Diagnóstico)",
        customer_email: "admin@oticasventara.com.br",
        customer_document: "12345678909",
        payment_method: "pix",
        amount_in_cents: 100,
        environment: creds.environment,
        status: pix.errorMessage ? "failed" : "pending",
        status_detail: pix.statusDetail || (pix.errorMessage ? "unauthorized" : "pending_waiting_transfer"),
        gateway_payment_id: pix.paymentId,
        error_message: pix.errorMessage || null,
        metadata: {
          diagnostic: true,
          token_source: body.access_token ? "form_input" : "database_or_env",
          has_token: Boolean(tokenToUse),
        },
      });

      const isRealError = Boolean(pix.errorMessage);
      const isSandboxOrMock = creds.environment === "sandbox" || (pix.isMock && !isRealError);

      return NextResponse.json({
        success: !isRealError,
        pix,
        environment: creds.environment,
        isSandbox: isSandboxOrMock,
        warning: isRealError
          ? null
          : isSandboxOrMock
          ? "Atenção: Este QR Code foi gerado em modo SANDBOX/SIMULAÇÃO. Ele NÃO será reconhecido por aplicativos de bancos reais (Itaú, Nubank, etc). Para receber pagamentos reais, configure credenciais de PRODUÇÃO no painel."
          : null,
      });
    }

    // 2. Ação padrão: Salvar configurações
    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!hasLiveDb) {
      return NextResponse.json(
        { error: "Banco de dados Supabase não configurado." },
        { status: 500 }
      );
    }

    const { data: existing } = await adminSupabase
      .from("site_settings")
      .select("id, value")
      .eq("key", "payment_settings")
      .maybeSingle();

    const previousValue = (existing?.value as any) || {};

    const updatedValue = {
      gateway: body.gateway || "mercadopago",
      environment: body.environment || "production",
      mercadopago_access_token:
        body.mercadopago_access_token !== undefined && body.mercadopago_access_token !== ""
          ? body.mercadopago_access_token.trim()
          : previousValue.mercadopago_access_token || null,
      mercadopago_public_key:
        body.mercadopago_public_key !== undefined
          ? body.mercadopago_public_key.trim()
          : previousValue.mercadopago_public_key || null,
      mercadopago_webhook_secret:
        body.mercadopago_webhook_secret !== undefined && body.mercadopago_webhook_secret !== ""
          ? body.mercadopago_webhook_secret.trim()
          : previousValue.mercadopago_webhook_secret || null,
      pix_enabled: body.pix_enabled ?? true,
      credit_card_enabled: body.credit_card_enabled ?? true,
    };

    const now = new Date().toISOString();

    if (existing?.id) {
      const { error } = await adminSupabase
        .from("site_settings")
        .update({
          value: updatedValue,
          description: "Configurações de Gateway de Pagamento (Mercado Pago)",
          updated_at: now,
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await adminSupabase.from("site_settings").insert({
        key: "payment_settings",
        description: "Configurações de Gateway de Pagamento (Mercado Pago)",
        value: updatedValue,
        updated_at: now,
      });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Configurações do Mercado Pago salvas com sucesso no banco de dados.",
      environment: updatedValue.environment,
      has_access_token: Boolean(updatedValue.mercadopago_access_token),
    });
  } catch (error: any) {
    console.error("Erro ao salvar configurações de pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao salvar configurações de pagamento." },
      { status: 500 }
    );
  }
}
