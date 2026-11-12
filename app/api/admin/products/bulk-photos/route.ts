import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface BulkPhotoResult {
  fileName: string;
  detectedSku: string;
  status: "matched" | "orphan" | "error";
  productId?: string;
  productName?: string;
  imageUrl?: string;
  isPrimary?: boolean;
  message?: string;
}

/**
 * Extrai o SKU base a partir do nome do arquivo.
 * Ex: VEN-CLS-01.jpg -> VEN-CLS-01
 * Ex: VEN-CLS-01_1.png -> VEN-CLS-01
 * Ex: VEN-CLS-01-frente.webp -> VEN-CLS-01
 */
function extractSkuFromFilename(filename: string): string {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
  // Remove sufixos como _1, _2, -frente, -verso, -lateral, _thumb
  const cleaned = nameWithoutExt
    .replace(/[_-](frente|verso|lado|lateral|detalhe|zoom|thumb|\d+)$/i, "")
    .trim();
  return cleaned.toUpperCase();
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado para processamento." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Carrega todos os produtos com SKU para casamento em memória rápido
    const { data: allProducts, error: prodErr } = await adminSupabase
      .from("products")
      .select("id, name, slug, sku, images:product_images(id, is_primary)");

    if (prodErr) {
      console.error("Erro ao buscar produtos para casamento de fotos:", prodErr);
      return NextResponse.json(
        { error: "Não foi possível carregar a lista de produtos para casamento." },
        { status: 500 }
      );
    }

    const productsBySku = new Map<string, any>();
    allProducts?.forEach((p) => {
      if (p.sku) {
        productsBySku.set(p.sku.toUpperCase().trim(), p);
      }
      // Casamento alternativo pelo slug em maiúsculas
      if (p.slug) {
        productsBySku.set(p.slug.toUpperCase().trim(), p);
      }
    });

    const results: BulkPhotoResult[] = [];
    let matchedCount = 0;
    let orphanCount = 0;

    for (const file of files) {
      const fileName = file.name;
      const detectedSku = extractSkuFromFilename(fileName);

      const matchedProduct =
        productsBySku.get(detectedSku) ||
        allProducts?.find((p) =>
          p.sku && p.sku.toUpperCase().includes(detectedSku)
        ) ||
        allProducts?.find((p) =>
          detectedSku.includes(p.sku?.toUpperCase() || "")
        );

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = matchedProduct
        ? `products/${safeFileName}`
        : `orphans/${safeFileName}`;

      const { data: uploadData, error: uploadErr } = await adminSupabase.storage
        .from("product-images")
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadErr) {
        results.push({
          fileName,
          detectedSku,
          status: "error",
          message: `Erro no upload: ${uploadErr.message}`,
        });
        continue;
      }

      const { data: publicUrlData } = adminSupabase.storage
        .from("product-images")
        .getPublicUrl(uploadData.path);

      const publicUrl = publicUrlData.publicUrl;

      if (matchedProduct) {
        const hasExistingImages =
          Array.isArray(matchedProduct.images) && matchedProduct.images.length > 0;
        const isPrimary = !hasExistingImages;

        // Insere na tabela de imagens do produto
        await adminSupabase.from("product_images").insert({
          product_id: matchedProduct.id,
          url: publicUrl,
          alt_text: `${matchedProduct.name} - ${detectedSku}`,
          is_primary: isPrimary,
          sort_order: hasExistingImages ? matchedProduct.images.length : 0,
        });

        matchedCount++;
        results.push({
          fileName,
          detectedSku,
          status: "matched",
          productId: matchedProduct.id,
          productName: matchedProduct.name,
          imageUrl: publicUrl,
          isPrimary,
        });
      } else {
        orphanCount++;
        results.push({
          fileName,
          detectedSku,
          status: "orphan",
          imageUrl: publicUrl,
          message: `Nenhum produto cadastrado com SKU "${detectedSku}". Aguardando vinculação.`,
        });
      }
    }

    // Invalidação de caches instantânea
    revalidatePath("/");
    revalidatePath("/armacoes");

    return NextResponse.json({
      success: true,
      summary: {
        totalFiles: files.length,
        matchedCount,
        orphanCount,
      },
      results,
    });
  } catch (err: any) {
    console.error("Erro no processamento em lote de fotos:", err);
    return NextResponse.json(
      { error: err.message || "Erro inesperado ao processar fotos em lote." },
      { status: 500 }
    );
  }
}
