import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: setting, error } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "analytics_utm")
      .maybeSingle();

    if (error || !setting) {
      // Retorna estado real limpo (zero dados fictícios)
      return NextResponse.json({
        summary: {
          total_pageviews: 0,
          total_utm_visits: 0,
          total_whatsapp_clicks: 0,
          total_cart_adds: 0,
        },
        campaigns: {},
        recent_visits: [],
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ...(setting.value || {}),
      updated_at: setting.updated_at,
    });
  } catch (error: any) {
    console.error("Erro ao obter estatísticas UTM:", error);
    return NextResponse.json(
      { error: "Erro ao buscar métricas", details: error.message },
      { status: 500 }
    );
  }
}
