import { NextRequest, NextResponse } from "next/server";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const socialProfile = String(body.social_profile || "").trim();
    const productName = String(body.product_name || "").trim();
    const productSlug = String(body.product_slug || "").trim();
    const lensType = String(body.lens_type || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Por favor, informe seu nome." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Por favor, informe seu número de WhatsApp com DDD." },
        { status: 400 }
      );
    }

    let leadId = `lead-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createStaticSupabaseClient();
        const { data, error } = await supabase
          .from("consultation_leads")
          .insert({
            name,
            phone,
            phone_normalized: cleanPhone,
            social_profile: socialProfile || null,
            product_name: productName || null,
            product_slug: productSlug || null,
            lens_type: lensType || null,
            notes: notes || null,
            status: "new",
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          leadId = data.id;
        } else if (error) {
          console.warn("Aviso ao salvar lead de consultoria no Supabase:", error.message);
        }
      } catch (err: any) {
        console.warn("Falha de conexão ao salvar lead no Supabase:", err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      message: "Lead registrado com sucesso",
    });
  } catch (err: any) {
    console.error("Erro na rota /api/leads/consultation:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar cadastro de lead." },
      { status: 500 }
    );
  }
}
