import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const author = body.author || "Administrador Ótica Ventara";
    const published = await PromotionService.publishDraft(author);

    return NextResponse.json({
      success: true,
      message: "Campanha publicada com sucesso!",
      published,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
