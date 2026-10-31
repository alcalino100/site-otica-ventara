import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_HERO_SLIDES } from "@/lib/site-settings-constants";
import { HeroSlide } from "@/types/ecommerce";

function isLiveDatabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;
  if (
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("seu-projeto") ||
    serviceRoleKey.includes("placeholder") ||
    serviceRoleKey.includes("sua-chave")
  ) {
    return false;
  }
  return true;
}

// Helper: busca slides armazenados na tabela site_settings (chave 'hero_slides')
async function getSlidesFromSiteSettings(adminSupabase: any): Promise<HeroSlide[]> {
  try {
    const { data, error } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_slides")
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
      return (data.value as HeroSlide[]).sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch (err) {
    console.warn("Aviso ao buscar slides no site_settings:", err);
  }
  return DEFAULT_HERO_SLIDES;
}

// Helper: persiste slides em site_settings de forma resiliente
async function saveSlidesToSiteSettings(
  adminSupabase: any,
  slides: HeroSlide[]
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { data: existing } = await adminSupabase
      .from("site_settings")
      .select("id")
      .eq("key", "hero_slides")
      .maybeSingle();

    if (existing?.id) {
      await adminSupabase
        .from("site_settings")
        .update({
          value: slides,
          description: "Slides Full-Bleed do Hero da Home",
          updated_at: now,
        })
        .eq("id", existing.id);
    } else {
      await adminSupabase.from("site_settings").insert({
        key: "hero_slides",
        description: "Slides Full-Bleed do Hero da Home",
        value: slides,
        updated_at: now,
      });
    }
  } catch (err) {
    console.warn("Aviso ao salvar slides no site_settings:", err);
  }
}

export async function GET() {
  try {
    if (!isLiveDatabaseConfigured()) {
      return NextResponse.json({ slides: DEFAULT_HERO_SLIDES });
    }

    const adminSupabase = createAdminClient();
    try {
      const { data, error } = await adminSupabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ slides: data });
      }
    } catch {}

    // Fallback transparente para site_settings
    const settingsSlides = await getSlidesFromSiteSettings(adminSupabase);
    return NextResponse.json({ slides: settingsSlides });
  } catch (err: any) {
    console.warn("Aviso ao buscar hero_slides, usando fallback:", err);
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

    const generatedId = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newSlide: HeroSlide = {
      id: body.id || generatedId,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
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

    if (!isLiveDatabaseConfigured()) {
      return NextResponse.json({ success: true, slide: newSlide });
    }

    const adminSupabase = createAdminClient();

    // 1. Tenta gravar na tabela dedicada hero_slides
    try {
      const { data, error } = await adminSupabase
        .from("hero_slides")
        .insert(newSlide)
        .select()
        .single();

      if (!error && data) {
        try {
          revalidatePath("/");
        } catch {}
        return NextResponse.json({ success: true, slide: data });
      }
    } catch {}

    // 2. Fallback resiliente para site_settings
    const currentSlides = await getSlidesFromSiteSettings(adminSupabase);
    newSlide.sort_order = currentSlides.length;
    const updated = [...currentSlides, newSlide];
    await saveSlidesToSiteSettings(adminSupabase, updated);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, slide: newSlide });
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

    if (!isLiveDatabaseConfigured()) {
      if (Array.isArray(body.reorder)) {
        return NextResponse.json({ success: true, message: "Ordem atualizada (simulada)." });
      }
      return NextResponse.json({ success: true, slide: body });
    }

    const adminSupabase = createAdminClient();

    // 1. Caso seja uma solicitação em lote para reordenação de slides
    if (Array.isArray(body.reorder)) {
      let dedicatedTableWorked = true;
      try {
        for (const item of body.reorder) {
          if (item.id && typeof item.sort_order === "number") {
            const { error } = await adminSupabase
              .from("hero_slides")
              .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
              .eq("id", item.id);
            if (error) dedicatedTableWorked = false;
          }
        }
      } catch {
        dedicatedTableWorked = false;
      }

      if (!dedicatedTableWorked) {
        // Fallback em site_settings para reordenação
        const currentSlides = await getSlidesFromSiteSettings(adminSupabase);
        const orderMap = new Map(body.reorder.map((r: any) => [r.id, r.sort_order]));
        const updated = currentSlides
          .map((s) => ({
            ...s,
            sort_order: orderMap.has(s.id) ? (orderMap.get(s.id) as number) : s.sort_order,
          }))
          .sort((a, b) => a.sort_order - b.sort_order);
        await saveSlidesToSiteSettings(adminSupabase, updated);
      }

      try {
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, message: "Ordem dos slides atualizada." });
    }

    // 2. Atualização individual de slide
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "ID do slide é obrigatório." }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    try {
      const { data, error } = await adminSupabase
        .from("hero_slides")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        try {
          revalidatePath("/");
        } catch {}
        return NextResponse.json({ success: true, slide: data });
      }
    } catch {}

    // Fallback resiliente para site_settings
    const currentSlides = await getSlidesFromSiteSettings(adminSupabase);
    let slideUpdated: HeroSlide | null = null;

    const updatedList: HeroSlide[] = currentSlides.map((slide) => {
      if (slide.id === id) {
        const merged: HeroSlide = { ...slide, ...updates };
        slideUpdated = merged;
        return merged;
      }
      return slide;
    });

    if (!slideUpdated) {
      slideUpdated = { id, ...updates } as HeroSlide;
      updatedList.push(slideUpdated);
    }

    await saveSlidesToSiteSettings(adminSupabase, updatedList);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, slide: slideUpdated });
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

    if (!isLiveDatabaseConfigured()) {
      return NextResponse.json({ success: true, message: "Slide excluído (simulação)." });
    }

    const adminSupabase = createAdminClient();
    try {
      const { error } = await adminSupabase.from("hero_slides").delete().eq("id", id);
      if (!error) {
        try {
          revalidatePath("/");
        } catch {}
        return NextResponse.json({ success: true, message: "Slide excluído com sucesso." });
      }
    } catch {}

    // Se a tabela falhar ou não existir, remove de site_settings
    const currentSlides = await getSlidesFromSiteSettings(adminSupabase);
    const filtered = currentSlides.filter((s) => s.id !== id);
    await saveSlidesToSiteSettings(adminSupabase, filtered);

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
