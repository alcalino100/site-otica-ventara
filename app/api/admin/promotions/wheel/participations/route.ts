import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";
import { CouponStatus } from "@/types/promotion-wheel";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as CouponStatus | "all") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const [participationsData, metrics] = await Promise.all([
      PromotionService.getParticipations({ search, status, page, pageSize }),
      PromotionService.getMetricsSummary(),
    ]);

    return NextResponse.json({
      ...participationsData,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
