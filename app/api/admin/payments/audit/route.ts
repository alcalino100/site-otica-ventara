import { NextRequest, NextResponse } from "next/server";
import { listPaymentTransactions } from "@/lib/payment-audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const method = searchParams.get("method") || "all";
    const search = searchParams.get("search") || "";
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
    console.error("Erro na API de auditoria de pagamentos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar histórico de pagamentos." },
      { status: 500 }
    );
  }
}
