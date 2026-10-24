import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
          images:product_images(id, url, is_primary, alt_text, sort_order),
          variants:product_variants(id, stock_quantity, sku, color_name)
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
        images:product_images(id, url, is_primary, alt_text, sort_order),
        variants:product_variants(id, stock_quantity, sku, color_name)
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
    const imagesToInsert: Array<{
      product_id: string;
      url: string;
      alt_text: string;
      is_primary: boolean;
      sort_order: number;
    }> = [];

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

    if (imagesToInsert.length > 0) {
      const { error: imgError } = await adminSupabase
        .from("product_images")
        .insert(imagesToInsert);

      if (imgError) {
        console.warn("Aviso ao vincular imagens do produto:", imgError);
      }
    }

    // 3. Cadastrar variação de estoque em 'product_variants'
    const cleanSlug = body.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    const skuGenerated = `VEN-${cleanSlug || "PROD"}-${Math.floor(100 + Math.random() * 900)}`;

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

    return NextResponse.json({
      success: true,
      product: productData,
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
    const newImages: Array<{
      product_id: string;
      url: string;
      alt_text: string;
      is_primary: boolean;
      sort_order: number;
    }> = [];

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

    if (newImages.length > 0) {
      // Remove imagens antigas e insere as novas organizadas
      await adminSupabase.from("product_images").delete().eq("product_id", id);
      await adminSupabase.from("product_images").insert(newImages);
    }

    // 3. Se fornecido estoque ou cor, atualiza variante
    if (typeof stock_quantity === "number" || color_name) {
      const { data: existingVariant } = await adminSupabase
        .from("product_variants")
        .select("id")
        .eq("product_id", id)
        .limit(1)
        .maybeSingle();

      if (existingVariant?.id) {
        await adminSupabase
          .from("product_variants")
          .update({
            ...(typeof stock_quantity === "number" ? { stock_quantity } : {}),
            ...(color_name ? { color_name } : {}),
          })
          .eq("id", existingVariant.id);
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

    return NextResponse.json({
      success: true,
      product: updatedProduct,
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
