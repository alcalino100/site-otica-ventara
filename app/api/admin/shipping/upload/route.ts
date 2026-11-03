import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado para upload." },
        { status: 400 }
      );
    }

    // 1. Validação de formato (JPG, PNG, WebP)
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    const isExtensionValid = file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    const isMimeValid = validMimes.includes(file.type.toLowerCase());

    if (!isMimeValid && !isExtensionValid) {
      return NextResponse.json(
        {
          error:
            "Formato inválido. Por favor, envie uma foto nos formatos JPG, PNG ou WebP.",
        },
        { status: 400 }
      );
    }

    // 2. Validação de tamanho máximo (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `Arquivo muito grande (${sizeMb} MB). O tamanho máximo permitido é 5 MB.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `shipping-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `shipping-images/${fileName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const hasLiveDb = Boolean(
      supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder-project")
    );

    if (!hasLiveDb) {
      // Simulação para ambientes locais/testes sem credenciais live
      const mockUrl = `/images/shipping/${fileName}`;
      return NextResponse.json({
        success: true,
        url: mockUrl,
        path: filePath,
      });
    }

    const adminSupabase = createAdminClient();

    // Garante que o bucket 'shipping-images' ou 'product-images' existe com visibilidade pública
    await adminSupabase.storage
      .createBucket("shipping-images", { public: true })
      .catch(() => null);

    const { error: uploadError } = await adminSupabase.storage
      .from("shipping-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      // Fallback para bucket 'product-images' se existir
      const { error: fallbackError } = await adminSupabase.storage
        .from("product-images")
        .upload(`shipping/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (fallbackError) {
        console.error("Erro no upload storage:", uploadError, fallbackError);
        return NextResponse.json(
          { error: `Falha ao gravar arquivo no Supabase Storage: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicData } = adminSupabase.storage
        .from("product-images")
        .getPublicUrl(`shipping/${fileName}`);

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        path: `shipping/${fileName}`,
      });
    }

    const { data: publicData } = adminSupabase.storage
      .from("shipping-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    console.error("Erro no endpoint /api/admin/shipping/upload:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar upload de imagem." },
      { status: 500 }
    );
  }
}
