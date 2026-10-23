import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, operatorName } = body;

    if (!code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório." }, { status: 400 });
    }

    const updated = await PromotionService.redeemCoupon(code, operatorName || "Balcão Loja Física");
    return NextResponse.json({
      success: true,
      message: `Cupom ${code} validado e resgatado com sucesso!`,
      coupon: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
