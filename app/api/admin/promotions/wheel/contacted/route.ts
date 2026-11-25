import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const b = await req.json().catch(() => ({}));
  if (!b.lead_id || typeof b.lead_id !== "string") return NextResponse.json({ error: "Lead não informado." }, { status: 400 });
  try {
    await PromotionService.setLeadContacted(b.lead_id, b.contacted !== false);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar. O SQL da roleta já foi aplicado?" }, { status: 500 });
  }
}
