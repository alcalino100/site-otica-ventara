import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { testMercadoPagoConnection } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/payments/test-connection
 * Testa a validade do Access Token do Mercado Pago via API oficial /users/me
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json().catch(() => ({}));
    const tokenToTest = body.access_token || body.accessToken;

    const result = await testMercadoPagoConnection(tokenToTest);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao testar conexão Mercado Pago:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Falha ao validar credenciais do Mercado Pago.",
      },
      { status: 500 }
    );
  }
}
