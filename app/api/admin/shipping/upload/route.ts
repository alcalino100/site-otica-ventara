import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { validateImageFile } from "@/lib/validations/image-upload";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Verificação estrita de autorização administrativa
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 2. Validação estrita de arquivo (MIME real, extensão, até 5 MB e nome seguro)
    const validation = await validateImageFile(file, "ship");
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status }
      );
    }

    const { buffer, safeFileName, mime } = validation;
    const filePath = `shipping-images/${safeFileName}`;

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
      const mockUrl = `/images/shipping/${safeFileName}`;
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
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      // Fallback para bucket 'product-images' se existir
      const { error: fallbackError } = await adminSupabase.storage
        .from("product-images")
        .upload(`shipping/${safeFileName}`, buffer, {
          contentType: mime,
          upsert: true,
        });

      if (fallbackError) {
        console.error("[Shipping Upload] Erro no upload storage:", uploadError, fallbackError);
        return NextResponse.json(
          { error: `Falha ao gravar arquivo no Supabase Storage: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicData } = adminSupabase.storage
        .from("product-images")
        .getPublicUrl(`shipping/${safeFileName}`);

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        path: `shipping/${safeFileName}`,
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
