import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMercadoPagoCredentials,
  testMercadoPagoConnection,
} from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function GET() {
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
  try {
    const body = await req.json();

    // 1. Ação especial: Testar Conexão em tempo real
    if (body.action === "test_connection") {
      const testResult = await testMercadoPagoConnection(body.access_token);
      return NextResponse.json(testResult);
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
