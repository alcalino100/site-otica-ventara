import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.type === "open") {
      await PromotionService.recordOpen();
    } else {
      await PromotionService.recordImpression();
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
