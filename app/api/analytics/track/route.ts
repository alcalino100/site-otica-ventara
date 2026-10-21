import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface UTMVisitPayload {
  path: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type?: "mobile" | "desktop" | "tablet";
  event_type?: "pageview" | "whatsapp_click" | "cart_add";
  session_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: UTMVisitPayload = await req.json();
    const {
      path = "/",
      referrer = "",
      utm_source = "",
      utm_medium = "",
      utm_campaign = "",
      utm_content = "",
      utm_term = "",
      device_type = "desktop",
      event_type = "pageview",
      session_id = "",
    } = body;

    const supabase = createAdminClient();

    // 1. Carrega o registro atual de analytics_utm de site_settings
    const { data: existingSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "analytics_utm")
      .maybeSingle();

    const currentVal = existingSetting?.value || {
      summary: {
        total_pageviews: 0,
        total_utm_visits: 0,
        total_whatsapp_clicks: 0,
        total_cart_adds: 0,
      },
      campaigns: {},
      recent_visits: [],
    };

    const summary = currentVal.summary || {
      total_pageviews: 0,
      total_utm_visits: 0,
      total_whatsapp_clicks: 0,
      total_cart_adds: 0,
    };

    const campaigns = currentVal.campaigns || {};
    const recentVisits = Array.isArray(currentVal.recent_visits)
      ? currentVal.recent_visits
      : [];

    const hasUtm = Boolean(utm_source || utm_campaign || utm_medium);

    if (event_type === "pageview") {
      summary.total_pageviews = (summary.total_pageviews || 0) + 1;
      if (hasUtm) {
        summary.total_utm_visits = (summary.total_utm_visits || 0) + 1;

        const campaignKey = utm_campaign || utm_source || "geral";
        if (!campaigns[campaignKey]) {
          campaigns[campaignKey] = {
            source: utm_source || "direto",
            medium: utm_medium || "cpc",
            content: utm_content || "",
            clicks: 1,
            landing_page_views: 1,
            whatsapp_conversions: 0,
            last_visit_at: new Date().toISOString(),
          };
        } else {
          campaigns[campaignKey].landing_page_views =
            (campaigns[campaignKey].landing_page_views || 0) + 1;
          campaigns[campaignKey].last_visit_at = new Date().toISOString();
          if (utm_content) campaigns[campaignKey].content = utm_content;
        }
      }

      // Adiciona aos acessos recentes
      const visitRecord = {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        path,
        referrer: referrer ? referrer.replace(/^https?:\/\//, "").substring(0, 60) : "Direto",
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        device_type,
        session_id: session_id ? session_id.substring(0, 16) : null,
      };

      recentVisits.unshift(visitRecord);
      if (recentVisits.length > 100) {
        recentVisits.pop();
      }
    } else if (event_type === "whatsapp_click") {
      summary.total_whatsapp_clicks = (summary.total_whatsapp_clicks || 0) + 1;
      if (utm_campaign && campaigns[utm_campaign]) {
        campaigns[utm_campaign].whatsapp_conversions =
          (campaigns[utm_campaign].whatsapp_conversions || 0) + 1;
      }
    } else if (event_type === "cart_add") {
      summary.total_cart_adds = (summary.total_cart_adds || 0) + 1;
    }

    // 2. Persiste no site_settings
    const updatedData = {
      summary,
      campaigns,
      recent_visits: recentVisits,
    };

    await supabase.from("site_settings").upsert(
      {
        key: "analytics_utm",
        value: updatedData,
        description: "Métricas de Acessos, UTMs e Conversão de Campanhas",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("Erro ao registrar analytics UTM:", error);
    return NextResponse.json(
      { error: "Falha ao registrar métrica", details: error.message },
      { status: 500 }
    );
  }
}
