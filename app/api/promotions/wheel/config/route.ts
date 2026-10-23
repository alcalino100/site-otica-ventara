import { NextResponse } from "next/server";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await PromotionService.getPublicCampaignConfig();
    if (!config) {
      return NextResponse.json({ is_enabled: false }, { status: 200 });
    }

    // Sanitiza e retorna apenas dados necessários para o cliente público
    // Não expõe pesos de outros segmentos ou dados internos desnecessários
    return NextResponse.json(
      {
        is_enabled: config.triggers.is_enabled && config.status === "active",
        config,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API Promotion Config] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao consultar campanha promocional." },
      { status: 500 }
    );
  }
}
