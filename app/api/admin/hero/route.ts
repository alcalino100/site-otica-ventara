import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_HERO_SLIDES } from "@/lib/site-settings-constants";
import { HeroSlide } from "@/types/ecommerce";

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("Aviso ao buscar hero_slides no admin:", error.message);
      return NextResponse.json({ slides: DEFAULT_HERO_SLIDES });
    }

    return NextResponse.json({ slides: data || DEFAULT_HERO_SLIDES });
  } catch (err: any) {
    console.error("Erro interno ao buscar hero_slides:", err);
    return NextResponse.json({ slides: DEFAULT_HERO_SLIDES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.image_url_desktop) {
      return NextResponse.json(
        { error: "A imagem para desktop é obrigatória." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Determina a ordem do próximo slide
    const { data: maxOrderData } = await adminSupabase
      .from("hero_slides")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = (maxOrderData?.[0]?.sort_order ?? -1) + 1;

    const newSlide = {
      sort_order: typeof body.sort_order === "number" ? body.sort_order : nextOrder,
      is_active: body.is_active ?? true,
      image_url_desktop: body.image_url_desktop.trim(),
      image_url_mobile: body.image_url_mobile?.trim() || null,
      alt_text: body.alt_text?.trim() || "Ótica Ventara — Armações Nobres e Lentes",
      focal_point_desktop: body.focal_point_desktop || "center",
      custom_position_x: Number.isFinite(body.custom_position_x) ? body.custom_position_x : 50,
      custom_position_y: Number.isFinite(body.custom_position_y) ? body.custom_position_y : 50,
      focal_point_mobile: body.focal_point_mobile || "center",
      fit_mode: body.fit_mode || "cover",
      overlay_intensity: Number.isFinite(body.overlay_intensity) ? body.overlay_intensity : 75,
      overlay_color: body.overlay_color || "#02070D",
      click_url: body.click_url?.trim() || null,
      show_only_photo: Boolean(body.show_only_photo),
      show_badge_quality: body.show_badge_quality ?? true,
      badge_quality_text: body.badge_quality_text || "QUALIDADE QUE VOCÊ VÊ",
      show_badge_style: body.show_badge_style ?? true,
      badge_style_text: body.badge_style_text || "ARMAÇÕES DE QUALIDADE E ESTILO",
      show_badge_stock: body.show_badge_stock ?? true,
      badge_stock_text: body.badge_stock_text || "Em Estoque · Envio Imediato",
      show_badge_curation: body.show_badge_curation ?? true,
      badge_curation_text: body.badge_curation_text || "Curadoria Autoral Ventara · Acetato Premium",
      badge_curation_url: body.badge_curation_url || "/catalogo",
      show_title: body.show_title ?? true,
      title_text: body.title_text || null,
      show_description: body.show_description ?? true,
      description_text: body.description_text || null,
      show_buttons: body.show_buttons ?? true,
      primary_button_text: body.primary_button_text || "Catálogo de Lentes",
      primary_button_url: body.primary_button_url || "/lentes",
      secondary_button_text: body.secondary_button_text || "Ver armações",
      secondary_button_url: body.secondary_button_url || "#armacoes",
      show_trust_markers: body.show_trust_markers ?? true,
    };

    const { data, error } = await adminSupabase
      .from("hero_slides")
      .insert(newSlide)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir hero_slide:", error);
      return NextResponse.json(
        { error: `Erro ao salvar slide no banco: ${error.message}` },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, slide: data });
  } catch (err: any) {
    console.error("Erro interno ao criar hero_slide:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar slide." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const adminSupabase = createAdminClient();

    // Caso seja uma solicitação em lote para reordenação de slides
    if (Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        if (item.id && typeof item.sort_order === "number") {
          await adminSupabase
            .from("hero_slides")
            .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
            .eq("id", item.id);
        }
      }
      try {
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, message: "Ordem dos slides atualizada." });
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "ID do slide é obrigatório." }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from("hero_slides")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar hero_slide:", error);
      return NextResponse.json(
        { error: `Erro ao atualizar slide: ${error.message}` },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, slide: data });
  } catch (err: any) {
    console.error("Erro interno ao atualizar hero_slide:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar slide." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do slide é obrigatório." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("hero_slides").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar hero_slide:", error);
      return NextResponse.json(
        { error: `Erro ao deletar slide: ${error.message}` },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, message: "Slide excluído com sucesso." });
  } catch (err: any) {
    console.error("Erro interno ao deletar hero_slide:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir slide." },
      { status: 500 }
    );
  }
}
