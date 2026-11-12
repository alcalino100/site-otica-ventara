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
    const validation = await validateImageFile(file, "hero");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const { buffer, safeFileName, mime } = validation;
    const filePath = `hero-banners/${safeFileName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const hasLiveDb = Boolean(
      supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder-project")
    );

    if (!hasLiveDb) {
      // Simulação estruturada para ambientes de teste, CI ou locais sem credenciais live
      const mockUrl = `https://placeholder-project.supabase.co/storage/v1/object/public/hero-images/${filePath}`;
      return NextResponse.json({
        success: true,
        url: mockUrl,
        path: filePath,
      });
    }

    const adminSupabase = createAdminClient();

    // Garante que o bucket 'hero-images' existe com visibilidade pública
    await adminSupabase.storage
      .createBucket("hero-images", { public: true })
      .catch(() => null);

    const { error: uploadError } = await adminSupabase.storage
      .from("hero-images")
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Hero Upload] Erro no upload para hero-images:", uploadError);
      return NextResponse.json(
        { error: `Falha ao gravar arquivo no Supabase Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = adminSupabase.storage
      .from("hero-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    console.error("[Hero Upload] Erro interno no upload do hero:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar upload da foto de fundo." },
      { status: 500 }
    );
  }
}
