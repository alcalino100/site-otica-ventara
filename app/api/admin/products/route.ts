import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { focusForSave } from "@/lib/image-focus";

export const dynamic = "force-dynamic";

type ProductImageRow = {
  product_id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  focus_x?: number;
  focus_y?: number;
};

const FOCUS_COLUMN_ERROR = /focus_[xy]/i;
const FOCUS_SQL_WARNING =
  "As fotos foram salvas, mas a posição ajustada NÃO foi gravada: falta rodar o SQL das colunas focus_x/focus_y no Supabase.";

/**
 * Insere as fotos do produto. Se o banco ainda não tem as colunas focus_x/focus_y,
 * grava as fotos sem a posição (nunca perde foto) e devolve focusDropped=true.
 */
async function insertProductImages(
  client: ReturnType<typeof createAdminClient>,
  rows: ProductImageRow[]
): Promise<{ ok: boolean; focusDropped: boolean; error?: string }> {
  if (rows.length === 0) return { ok: true, focusDropped: false };

  const first = await client.from("product_images").insert(rows);
  if (!first.error) return { ok: true, focusDropped: false };

  if (FOCUS_COLUMN_ERROR.test(first.error.message)) {
    const withoutFocus = rows.map(({ focus_x: _x, focus_y: _y, ...rest }) => rest);
    const retry = await client.from("product_images").insert(withoutFocus);
    if (!retry.error) {
      return { ok: true, focusDropped: rows.some((r) => r.focus_x !== undefined) };
    }
    return { ok: false, focusDropped: false, error: retry.error.message };
  }
  return { ok: false, focusDropped: false, error: first.error.message };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminSupabase = createAdminClient();

    if (id) {
      // Busca produto específico
      const { data, error } = await adminSupabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(*),
          variants:product_variants(id, stock_quantity, sku, color_name, color_hex, size, price_in_cents, compare_at_price_in_cents, image_url, is_available, sort_order)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        // Fallback para DEFAULT_CATALOG se offline ou não encontrado no Supabase
        const fallback = DEFAULT_CATALOG.find((p) => p.id === id || p.slug === id);
        if (fallback) {
          return NextResponse.json({ success: true, product: fallback });
        }
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
      }

      return NextResponse.json({ success: true, product: data });
    }

    // Busca lista de todos os produtos
    const { data, error } = await adminSupabase
      .from("products")
      .select(`
        *,
        category:categories(name, slug),
        images:product_images(*),
        variants:product_variants(id, stock_quantity, sku, color_name, color_hex, size, price_in_cents, compare_at_price_in_cents, image_url, is_available, sort_order)
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, products: DEFAULT_CATALOG });
    }

    return NextResponse.json({ success: true, products: data });
  } catch (err: any) {
    console.warn("Fallback de consulta para DEFAULT_CATALOG:", err.message);
    return NextResponse.json({ success: true, products: DEFAULT_CATALOG });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Nome e slug do produto são obrigatórios." },
        { status: 400 }
      );
    }

    if (typeof body.price_in_cents !== "number" || body.price_in_cents < 0) {
      return NextResponse.json(
        { error: "Preço em centavos inválido." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Determina category_id se não fornecido
    let categoryId = body.category_id || null;
    if (!categoryId) {
      const targetSlug =
        body.gender === "Infantil" || body.frame_type === "Infantil"
          ? "infantil"
          : body.frame_type === "Solar"
          ? "solar"
          : "grau";

      const { data: catData } = await adminSupabase
        .from("categories")
        .select("id")
        .eq("slug", targetSlug)
        .maybeSingle();

      if (catData?.id) {
        categoryId = catData.id;
      }
    }

    // Determina brand_id se não fornecido (marca oficial Ventara)
    let brandId = body.brand_id || null;
    if (!brandId) {
      const { data: brandData } = await adminSupabase
        .from("brands")
        .select("id")
        .eq("slug", "ventara")
        .maybeSingle();

      if (brandData?.id) {
        brandId = brandData.id;
      }
    }

    // 1. Cadastrar produto na tabela 'products'
    const { data: productData, error: productError } = await adminSupabase
      .from("products")
      .insert({
        category_id: categoryId,
        brand_id: brandId,
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description ? body.description.trim() : null,
        price_in_cents: body.price_in_cents,
        compare_at_price_in_cents: body.compare_at_price_in_cents || null,
        is_published: body.is_published ?? true,
        is_featured: body.is_featured ?? false,
        frame_type: body.frame_type || "Grau",
        frame_shape: body.frame_shape || "Quadrado",
        frame_material: body.frame_material || "Acetato Premium",
        gender: body.gender || "Unissex",
        dimensions_lens_mm: body.dimensions_lens_mm || null,
        dimensions_bridge_mm: body.dimensions_bridge_mm || null,
        dimensions_temple_mm: body.dimensions_temple_mm || null,
        dimensions_frame_width_mm: body.dimensions_frame_width_mm || null,
        dimensions_lens_height_mm: body.dimensions_lens_height_mm || null,
        has_temple_engraving: Boolean(body.has_temple_engraving),
        material_origin: body.material_origin || null,
      })
      .select()
      .single();

    if (productError) {
      console.error("Erro ao inserir produto:", productError);
      return NextResponse.json(
        { error: `Erro ao cadastrar produto: ${productError.message}` },
        { status: 400 }
      );
    }

    const productId = productData.id;

    // 2. Normaliza lista de fotos múltiplas (suporte a 1, 2, 3, 4, 5+ fotos)
    const imagesToInsert: ProductImageRow[] = [];

    if (Array.isArray(body.images) && body.images.length > 0) {
      body.images.forEach((img: any, idx: number) => {
        const url = typeof img === "string" ? img : img.url;
        if (url && typeof url === "string" && url.trim()) {
          imagesToInsert.push({
            product_id: productId,
            url: url.trim(),
            alt_text: img.alt_text || `${body.name.trim()} - Foto ${idx + 1}`,
            is_primary: img.is_primary ?? idx === 0,
            sort_order: idx,
            ...(focusForSave(img) ?? {}),
          });
        }
      });
    } else if (Array.isArray(body.imageUrls) && body.imageUrls.length > 0) {
      body.imageUrls.forEach((url: string, idx: number) => {
        if (url && typeof url === "string" && url.trim()) {
          imagesToInsert.push({
            product_id: productId,
            url: url.trim(),
            alt_text: `${body.name.trim()} - Foto ${idx + 1}`,
            is_primary: idx === 0,
            sort_order: idx,
          });
        }
      });
    } else if (body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.trim()) {
      imagesToInsert.push({
        product_id: productId,
        url: body.imageUrl.trim(),
        alt_text: body.name.trim(),
        is_primary: true,
        sort_order: 0,
      });
    }

    let postWarning: string | undefined;
    if (imagesToInsert.length > 0) {
      const imgResult = await insertProductImages(adminSupabase, imagesToInsert);
      if (!imgResult.ok) {
        console.warn("Aviso ao vincular imagens do produto:", imgResult.error);
      } else if (imgResult.focusDropped) {
        postWarning = FOCUS_SQL_WARNING;
      }
    }

    // 3. Cadastrar variações de cor e acabamento em 'product_variants'
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      const variantsToInsert = body.variants.map((v: any, idx: number) => {
        const varSku = v.sku || `${productData.sku || "VEN-PROD"}-${idx + 1}`;
        return {
          product_id: productId,
          sku: String(varSku).trim().toUpperCase(),
          color_name: v.color_name || v.name || "Padrão",
          color_hex: v.color_hex || "#0f172a",
          size: v.size || "Único",
          stock_quantity: typeof v.stock_quantity === "number" ? v.stock_quantity : 5,
          price_in_cents: typeof v.price_in_cents === "number" ? v.price_in_cents : productData.price_in_cents,
          compare_at_price_in_cents:
            typeof v.compare_at_price_in_cents === "number"
              ? v.compare_at_price_in_cents
              : productData.compare_at_price_in_cents,
          image_url: v.image_url || imagesToInsert[0]?.url || null,
          is_available: v.is_available !== false,
          sort_order: idx,
        };
      });

      const { error: variantError } = await adminSupabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantError) {
        console.warn("Aviso ao criar variantes estruturadas:", variantError);
      }
    } else {
      const cleanSlug = body.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
      const skuGenerated = body.sku || `VEN-${cleanSlug || "PROD"}-${Math.floor(100 + Math.random() * 900)}`;

      const { error: variantError } = await adminSupabase.from("product_variants").insert({
        product_id: productId,
        sku: skuGenerated,
        color_name: body.color_name || "Padrão",
        size: "Único",
        stock_quantity: typeof body.stock_quantity === "number" ? body.stock_quantity : 1,
      });

      if (variantError) {
        console.warn("Aviso ao criar variante de estoque:", variantError);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/armacoes");
      revalidatePath(`/produto/${productData.slug}`);
      revalidatePath(`/armacoes/${productData.slug}`);
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação
    }

    return NextResponse.json({
      success: true,
      product: productData,
      ...(postWarning ? { warning: postWarning } : {}),
    });
  } catch (err: any) {
    console.error("Erro interno no cadastro de produtos:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar produto." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();
    const { id, images, imageUrls, imageUrl, stock_quantity, color_name, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "O ID do produto é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Atualiza campos cadastrais na tabela 'products'
    const { data: updatedProduct, error: productError } = await adminSupabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (productError) {
      console.error("Erro ao atualizar produto no Supabase:", productError);
      return NextResponse.json(
        { error: `Erro ao atualizar produto: ${productError.message}` },
        { status: 400 }
      );
    }

    // 2. Se fornecido conjunto de imagens, substitui na tabela 'product_images'
    const newImages: ProductImageRow[] = [];

    if (Array.isArray(images)) {
      images.forEach((img: any, idx: number) => {
        const url = typeof img === "string" ? img : img.url;
        if (url && typeof url === "string" && url.trim()) {
          newImages.push({
            product_id: id,
            url: url.trim(),
            alt_text: img.alt_text || `${updatedProduct?.name || "Armação"} - Foto ${idx + 1}`,
            is_primary: img.is_primary ?? idx === 0,
            sort_order: idx,
            ...(focusForSave(img) ?? {}),
          });
        }
      });
    } else if (Array.isArray(imageUrls)) {
      imageUrls.forEach((url: string, idx: number) => {
        if (url && typeof url === "string" && url.trim()) {
          newImages.push({
            product_id: id,
            url: url.trim(),
            alt_text: `${updatedProduct?.name || "Armação"} - Foto ${idx + 1}`,
            is_primary: idx === 0,
            sort_order: idx,
          });
        }
      });
    }

    let patchWarning: string | undefined;
    if (newImages.length > 0) {
      // Guarda as fotos atuais: se a gravação das novas falhar, elas são restauradas
      const { data: previousImages } = await adminSupabase
        .from("product_images")
        .select("*")
        .eq("product_id", id);

      // Remove imagens antigas e insere as novas organizadas
      await adminSupabase.from("product_images").delete().eq("product_id", id);
      const imgResult = await insertProductImages(adminSupabase, newImages);

      if (!imgResult.ok) {
        if (previousImages && previousImages.length > 0) {
          await adminSupabase.from("product_images").insert(previousImages);
        }
        return NextResponse.json(
          { error: `Não foi possível salvar as fotos (nada foi perdido): ${imgResult.error}` },
          { status: 500 }
        );
      }
      if (imgResult.focusDropped) patchWarning = FOCUS_SQL_WARNING;
    }

    // 3. Se fornecido estoque ou cor, atualiza variantes de estoque
    if (typeof stock_quantity === "number" || color_name) {
      const { data: existingVariants } = await adminSupabase
        .from("product_variants")
        .select("id, color_name")
        .eq("product_id", id);

      if (existingVariants && existingVariants.length > 0) {
        if (typeof stock_quantity === "number") {
          // Atualiza o saldo em todas as variantes do produto para evitar variantes zeradas fantasmas
          await adminSupabase
            .from("product_variants")
            .update({ stock_quantity, updated_at: new Date().toISOString() })
            .eq("product_id", id);
        }
        if (color_name) {
          await adminSupabase
            .from("product_variants")
            .update({ color_name, updated_at: new Date().toISOString() })
            .eq("id", existingVariants[0].id);
        }
      } else {
        await adminSupabase.from("product_variants").insert({
          product_id: id,
          sku: `VEN-${id.slice(0, 6).toUpperCase()}-01`,
          color_name: color_name || "Padrão",
          size: "Único",
          stock_quantity: typeof stock_quantity === "number" ? stock_quantity : 5,
        });
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/armacoes");
      if (updatedProduct?.slug) {
        revalidatePath(`/produto/${updatedProduct.slug}`);
        revalidatePath(`/armacoes/${updatedProduct.slug}`);
      }
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      ...(patchWarning ? { warning: patchWarning } : {}),
    });
  } catch (err: any) {
    console.error("Erro interno ao atualizar produto:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar produto." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const { searchParams } = new URL(req.url);
    const idFromQuery = searchParams.get("id");

    let productId = idFromQuery;
    if (!productId) {
      try {
        const body = await req.json();
        productId = body.id;
      } catch {
        // body pode ser vazio se enviado via query string
      }
    }

    if (!productId) {
      return NextResponse.json(
        { error: "O ID do produto é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Limpa vínculos nas tabelas filhas defensivamente antes da remoção
    await adminSupabase.from("product_images").delete().eq("product_id", productId);
    await adminSupabase.from("product_variants").delete().eq("product_id", productId);
    await adminSupabase.from("stock_movements").delete().eq("product_id", productId);

    // 2. Remove o produto da tabela 'products' com chave de admin
    const { data, error } = await adminSupabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Erro ao excluir produto no Supabase:", error);
      return NextResponse.json(
        { error: `Erro ao excluir produto: ${error.message}` },
        { status: 500 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/armacoes");
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação
    }

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso do banco de dados.",
      deleted: data,
    });
  } catch (err: any) {
    console.error("Erro interno ao excluir produto:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir produto." },
      { status: 500 }
    );
  }
}
