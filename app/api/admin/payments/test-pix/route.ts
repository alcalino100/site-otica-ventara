import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import {
  getMercadoPagoCredentials,
  createMercadoPagoPixPayment,
} from "@/lib/mercadopago";
import { recordPaymentTransaction } from "@/lib/payment-audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/payments/test-pix
 * Gera uma cobrança Pix de teste (R$ 1,00) com QR Code e Copia e Cola,
 * gravando auditoria completa da transação.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json().catch(() => ({}));
    const creds = await getMercadoPagoCredentials();
    const tokenOverride = body.access_token || body.accessToken;
    const tokenToUse = tokenOverride ? String(tokenOverride).trim() : creds.accessToken;

    const refCode = `TESTE-${Date.now().toString(36).toUpperCase()}`;

    // 1. Validação prévia de credencial amigável
    if (!tokenToUse || tokenToUse.length < 15) {
      const friendlyError =
        "Access Token do Mercado Pago não configurado ou incompleto. Configure seu Access Token (iniciado por APP_USR-... ou TEST-...) na seção de credenciais antes de gerar o Pix de teste.";

      await recordPaymentTransaction({
        reference_code: refCode,
        customer_name: "Teste Administrador (Diagnóstico)",
        customer_email: "admin@oticasventara.com.br",
        customer_document: "12345678909",
        payment_method: "pix",
        amount_in_cents: 100,
        environment: creds.environment,
        status: "failed",
        status_detail: "unauthorized",
        gateway_payment_id: `MP-ERR-CREDS-${Date.now()}`,
        error_message: friendlyError,
        metadata: {
          diagnostic: true,
          token_source: tokenOverride ? "form_input" : "database_or_env",
          has_token: false,
        },
      });

      return NextResponse.json({
        success: false,
        pix: {
          paymentId: `MP-ERR-CREDS-${Date.now()}`,
          status: "rejected",
          statusDetail: "unauthorized",
          qrCode: "",
          qrCodeBase64: null,
          errorMessage: friendlyError,
        },
        environment: creds.environment,
        isSandbox: creds.environment === "sandbox",
        warning: null,
      });
    }

    // 2. Chamada à API oficial do Mercado Pago para gerar Pix
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
      accessTokenOverride: tokenOverride ? String(tokenOverride).trim() : undefined,
    });

    const isRealError = Boolean(pix.errorMessage);
    const isSandboxOrMock = creds.environment === "sandbox" || (pix.isMock && !isRealError);

    // 3. Auditoria imediata da transação de teste
    await recordPaymentTransaction({
      reference_code: refCode,
      customer_name: "Teste Administrador (Diagnóstico)",
      customer_email: "admin@oticasventara.com.br",
      customer_document: "12345678909",
      payment_method: "pix",
      amount_in_cents: 100,
      environment: creds.environment,
      status: isRealError ? "failed" : "pending",
      status_detail:
        pix.statusDetail || (isRealError ? "unauthorized" : "pending_waiting_transfer"),
      gateway_payment_id: pix.paymentId,
      error_message: pix.errorMessage || null,
      metadata: {
        diagnostic: true,
        token_source: tokenOverride ? "form_input" : "database_or_env",
        has_token: true,
      },
    });

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
  } catch (error: any) {
    console.error("Erro na API de teste Pix:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro inesperado ao gerar Pix de teste.",
        pix: {
          errorMessage: error.message || "Falha de rede ao conectar com o gateway.",
        },
      },
      { status: 500 }
    );
  }
}
