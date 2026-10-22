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

    // Validação de tipo de arquivo
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/jpg",
    ];

    if (!validMimes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i)) {
      return NextResponse.json(
        { error: "Formato de arquivo inválido. Envie uma imagem JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Validação de tamanho (máximo 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O tamanho máximo permitido é 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const hasLiveDb = Boolean(
      supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder-project")
    );

    if (!hasLiveDb) {
      // Simulação estruturada para ambientes de teste, CI ou sem credenciais
      const mockUrl = `https://placeholder-project.supabase.co/storage/v1/object/public/product-images/${filePath}`;
      return NextResponse.json({
        success: true,
        url: mockUrl,
        path: filePath,
      });
    }

    const adminSupabase = createAdminClient();

    // Garante que o bucket 'product-images' existe com visibilidade pública
    await adminSupabase.storage
      .createBucket("product-images", { public: true })
      .catch(() => null);

    const { error: uploadError } = await adminSupabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro no upload do admin:", uploadError);
      return NextResponse.json(
        { error: `Falha ao gravar arquivo no Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = adminSupabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    console.error("Erro interno no upload:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar upload de imagem." },
      { status: 500 }
    );
  }
}
