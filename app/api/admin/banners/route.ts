import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.image_url_desktop) {
      return NextResponse.json(
        { error: "Título e imagem desktop são obrigatórios." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("homepage_banners")
      .insert({
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        cta_text: body.cta_text?.trim() || null,
        cta_url: body.cta_url?.trim() || null,
        image_url_desktop: body.image_url_desktop.trim(),
        image_url_mobile: body.image_url_mobile?.trim() || null,
        alt_text: body.alt_text?.trim() || body.title.trim(),
        sort_order: typeof body.sort_order === "number" ? body.sort_order : 1,
        is_published: body.is_published ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao cadastrar banner:", error);
      return NextResponse.json(
        { error: `Erro ao cadastrar banner: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      banner: data,
    });
  } catch (err: any) {
    console.error("Erro interno ao criar banner:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar banner." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "O ID do banner é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("homepage_banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar banner:", error);
      return NextResponse.json(
        { error: `Erro ao atualizar banner: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      banner: data,
    });
  } catch (err: any) {
    console.error("Erro interno ao atualizar banner:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idFromQuery = searchParams.get("id");

    let bannerId = idFromQuery;
    if (!bannerId) {
      try {
        const body = await req.json();
        bannerId = body.id;
      } catch {
        // body pode ser vazio
      }
    }

    if (!bannerId) {
      return NextResponse.json(
        { error: "O ID do banner é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("homepage_banners")
      .delete()
      .eq("id", bannerId)
      .select();

    if (error) {
      console.error("Erro ao excluir banner:", error);
      return NextResponse.json(
        { error: `Erro ao excluir banner: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Banner excluído com sucesso.",
      deleted: data,
    });
  } catch (err: any) {
    console.error("Erro interno ao excluir banner:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir banner." },
      { status: 500 }
    );
  }
}
