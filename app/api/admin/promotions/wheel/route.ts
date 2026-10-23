import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await PromotionService.getAdminCampaignData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.draft) {
      return NextResponse.json({ error: "Rascunho não fornecido." }, { status: 400 });
    }

    await PromotionService.saveDraft(body.draft);
    return NextResponse.json({ success: true, message: "Rascunho salvo com sucesso." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
