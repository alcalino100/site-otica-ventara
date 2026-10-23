import { NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csvContent = await PromotionService.exportParticipationsCsv();

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="participacoes-roleta-ventara-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
