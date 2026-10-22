import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SiteIdentitySettings, SiteAppearanceSettings } from "@/types/ecommerce";
import { DEFAULT_IDENTITY, DEFAULT_APPEARANCE } from "@/lib/site-settings-constants";

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["identity", "appearance", "shipping"]);

    if (error) {
      console.warn("Aviso ao buscar configurações:", error.message);
      return NextResponse.json({
        identity: DEFAULT_IDENTITY,
        appearance: DEFAULT_APPEARANCE,
      });
    }

    const identityRow = data?.find((s) => s.key === "identity");
    const appearanceRow = data?.find((s) => s.key === "appearance");
    const shippingRow = data?.find((s) => s.key === "shipping");

    return NextResponse.json({
      identity: identityRow?.value ? { ...DEFAULT_IDENTITY, ...(identityRow.value as SiteIdentitySettings) } : DEFAULT_IDENTITY,
      appearance: appearanceRow?.value ? { ...DEFAULT_APPEARANCE, ...(appearanceRow.value as SiteAppearanceSettings) } : DEFAULT_APPEARANCE,
      shipping: shippingRow?.value || null,
    });
  } catch (err: any) {
    console.error("Erro interno ao buscar configurações:", err);
    return NextResponse.json({
      identity: DEFAULT_IDENTITY,
      appearance: DEFAULT_APPEARANCE,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    async function saveSetting(key: string, description: string, value: any) {
      const { data: existing } = await adminSupabase
        .from("site_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await adminSupabase
          .from("site_settings")
          .update({
            value,
            description,
            updated_at: now,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await adminSupabase
          .from("site_settings")
          .insert({
            key,
            description,
            value,
            updated_at: now,
          });
        if (error) throw error;
      }
    }

    if (body.identity) {
      await saveSetting("identity", "Identidade da Marca, Contatos e Redes Sociais", body.identity);
    }

    if (body.appearance) {
      await saveSetting("appearance", "Paleta de Cores e Tokens Visuais", body.appearance);
    }

    if (body.shipping) {
      await saveSetting("shipping", "Regras de Frete e Retirada Presencial", body.shipping);
    }

    return NextResponse.json({
      success: true,
      message: "Configurações salvas e aplicadas com sucesso no site.",
    });
  } catch (err: any) {
    console.error("Erro ao salvar configurações:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar configurações." },
      { status: 500 }
    );
  }
}
