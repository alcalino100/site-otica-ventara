import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { listPaymentTransactions } from "@/lib/payment-audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payments/transactions
 * Lista transações e métricas para o painel de auditoria de pagamentos
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const method = searchParams.get("method") || searchParams.get("payment_method") || "all";
    const search = searchParams.get("search") || searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await listPaymentTransactions({
      status,
      method,
      search,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro na API de transações de pagamentos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar histórico de pagamentos." },
      { status: 500 }
    );
  }
}
