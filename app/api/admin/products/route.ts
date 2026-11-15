import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { revalidateProductPages } from "@/lib/revalidate-products";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createStaticSupabaseClient } from "@/lib/supabase/static";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { normalizeFaceFit, idealFaceLabels, hasFaceFit } from "@/lib/face-shapes";
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

      if (error) {
        console.error("Erro ao carregar produto no admin:", error.message);
        return NextResponse.json(
          { error: "Não foi possível carregar o produto agora. Tente novamente em instantes." },
          { status: 503 }
        );
      }

      if (!data) {
        // Catálogo de demonstração só existe sem banco configurado (nunca mascara produto real ausente)
        const fallback = !isSupabaseConfigured()
          ? DEFAULT_CATALOG.find((p) => p.id === id || p.slug === id)
          : undefined;
        if (fallback) {
          return NextResponse.json({ success: true, product: fallback });
        }
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
      }

      return NextResponse.json({ success: true, product: data });
    }

    // Sem banco configurado (desenvolvimento): catálogo de demonstração
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, products: DEFAULT_CATALOG });
    }

    // Busca lista de todos os produtos (uma nova tentativa se falhar: erros de conexão costumam ser passageiros)
    const loadList = () =>
      adminSupabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(*),
          variants:product_variants(id, stock_quantity, sku, color_name, color_hex, size, price_in_cents, compare_at_price_in_cents, image_url, is_available, sort_order)
        `)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

    let { data, error } = await loadList();
    if (error) {
      console.warn("Falha ao listar produtos, tentando de novo:", error.message);
      ({ data, error } = await loadList());
    }

    if (error) {
      // NUNCA devolver o catálogo de demonstração aqui: os produtos reais "sumiriam" do painel
      console.error("Erro ao listar produtos no admin:", error.message);
      return NextResponse.json(
        { error: "Não foi possível carregar os produtos agora. Seus produtos continuam salvos; tente de novo em instantes." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    console.error("Erro inesperado ao listar produtos no admin:", err?.message);
    return NextResponse.json(
      { error: "Não foi possível carregar os produtos agora. Seus produtos continuam salvos; tente de novo em instantes." },
      { status: 503 }
    );
  }
}


const FACE_COLUMN_ERROR = /face_shape/i;
const FACE_SQL_WARNING =
  "As armações foram salvas, mas a indicação por formato de rosto NÃO foi gravada: falta rodar o SQL da coluna face_shape_fit no Supabase.";

/** Grava a indicação por rosto à parte: se a coluna ainda não existir, o resto do cadastro não é perdido. */
async function saveFaceFit(client: any, productId: string, raw: unknown): Promise<string | undefined> {
  const fit = normalizeFaceFit(raw);
  const { error } = await client
    .from("products")
    .update({ face_shape_fit: fit, face_shape_recommendations: idealFaceLabels(fit) })
    .eq("id", productId);
  if (!error) return undefined;
  // Sem nada para gravar e coluna ausente: não vale alarmar
  if (FACE_COLUMN_ERROR.test(error.message || "")) return hasFaceFit(fit) ? FACE_SQL_WARNING : undefined;
  console.warn("Aviso ao salvar indicação por rosto:", error.message);
  return undefined;
}


/**
 * Mantém `status` (usado pelas regras de acesso do banco) coerente com `is_published` (gravado pelo admin).
 * Sem isso, o banco pode esconder cores e fotos do visitante mesmo com o produto aparecendo.
 * Se a coluna ainda não existe (migração antiga), ignora.
 */
async function syncPublishStatus(client: any, productId: string, isPublished: boolean): Promise<void> {
  const { error } = await client
    .from("products")
    .update({ status: isPublished ? "publicado" : "rascunho" })
    .eq("id", productId);
  if (error && !/status/i.test(error.message || "")) {
    console.warn("Aviso ao sincronizar status de publicação:", error.message);
  }
}

/**
 * Depois de salvar, lê o produto COMO VISITANTE (mesma leitura do site) e confere se produto, cores e fotos
 * estão visíveis. Se não estiverem, devolve um aviso claro para o admin em vez de falhar em silêncio.
 */
async function verifyPublicVisibility(
  productId: string,
  expected: { published: boolean; colors?: string[]; images?: number }
): Promise<string | undefined> {
  if (!expected.published || !isSupabaseConfigured()) return undefined;
  try {
    const pub = createStaticSupabaseClient();
    const { data, error } = await pub
      .from("products")
      .select("id, images:product_images(id), variants:product_variants(color_name)")
      .eq("id", productId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) return undefined; // não deu para conferir: não alarma à toa

    if (!data) {
      return "ATENÇÃO: o produto foi salvo, mas o site NÃO está conseguindo exibi-lo para os visitantes (regra de publicação do banco desalinhada). Avise o suporte técnico para rodar o SQL de visibilidade.";
    }

    const problems: string[] = [];
    const publicColors = new Set<string>(
      ((data as any).variants || []).map((v: { color_name: string }) => String(v.color_name || "").trim().toLowerCase())
    );
    const missingColors = (expected.colors || []).filter((c) => !publicColors.has(c.trim().toLowerCase()));
    if (missingColors.length > 0) {
      problems.push(`as cores ${missingColors.join(", ")} NÃO aparecem para os visitantes`);
    }
    if (typeof expected.images === "number" && expected.images > 0 && ((data as any).images || []).length < expected.images) {
      problems.push("as fotos NÃO aparecem para os visitantes");
    }

    return problems.length > 0
      ? `ATENÇÃO: o produto foi salvo, mas no site ${problems.join(" e ")} (regra de acesso do banco). Avise o suporte técnico para rodar o SQL de visibilidade.`
      : undefined;
  } catch (err: any) {
    console.warn("Não foi possível conferir a visibilidade pública:", err?.message);
    return undefined;
  }
}

/** Procura um slug livre: base, base-2, base-3... */
async function uniqueProductSlug(client: any, base: string): Promise<string> {
  const { data } = await client.from("products").select("slug").like("slug", `${base}%`);
  const taken = new Set<string>((data || []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 200; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/** Erros do banco em português (o cliente vê isto na tela do admin). */
function friendlyProductError(error: { message?: string; code?: string }): string {
  const msg = error.message || "";
  if (error.code === "23505" || /duplicate key/i.test(msg)) {
    return "Já existe um produto com esses dados (nome ou código repetido). Mude o nome e tente de novo.";
  }
  if (error.code === "23502" || /null value in column/i.test(msg)) {
    return "Falta preencher um campo obrigatório do produto. Confira o nome e o preço.";
  }
  if (/row-level security|permission denied/i.test(msg)) {
    return "O banco recusou o cadastro por permissão. Avise o suporte técnico.";
  }
  return `Não foi possível cadastrar o produto agora. Tente de novo; se repetir, avise o suporte. (Detalhe técnico: ${msg || "sem detalhe"})`;
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

    // Slug único: se já existe produto com o mesmo nome, salva como "nome-2", "nome-3"... em vez de falhar
    const requestedSlug = String(body.slug).trim();
    const finalSlug = await uniqueProductSlug(adminSupabase, requestedSlug);
    const slugAdjusted = finalSlug !== requestedSlug;

    // 1. Cadastrar produto na tabela 'products'
    const { data: productData, error: productError } = await adminSupabase
      .from("products")
      .insert({
        category_id: categoryId,
        brand_id: brandId,
        name: body.name.trim(),
        slug: finalSlug,
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
      return NextResponse.json({ error: friendlyProductError(productError) }, { status: 400 });
    }

    const productId = productData.id;

    // Status coerente com is_published (o banco usa 'status' nas regras de acesso do visitante)
    await syncPublishStatus(adminSupabase, productId, body.is_published ?? true);

    const faceWarning = Object.prototype.hasOwnProperty.call(body, "face_shape_fit")
      ? await saveFaceFit(adminSupabase, productId, body.face_shape_fit)
      : undefined;

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

    let postWarning: string | undefined = faceWarning;
    if (imagesToInsert.length > 0) {
      const imgResult = await insertProductImages(adminSupabase, imagesToInsert);
      if (!imgResult.ok) {
        console.warn("Aviso ao vincular imagens do produto:", imgResult.error);
      } else if (imgResult.focusDropped) {
        postWarning = [postWarning, FOCUS_SQL_WARNING].filter(Boolean).join(" ");
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

      let { error: variantError } = await adminSupabase.from("product_variants").insert(variantsToInsert);

      // SKU repetido (ex.: mesmo código gerado em outro produto): tenta de novo com sufixo único
      if (variantError && (variantError.code === "23505" || /duplicate key/i.test(variantError.message || ""))) {
        const stamp = Date.now().toString(36).slice(-4).toUpperCase();
        const retryRows = variantsToInsert.map((row: any, idx: number) => ({ ...row, sku: `${row.sku}-${stamp}${idx}` }));
        ({ error: variantError } = await adminSupabase.from("product_variants").insert(retryRows));
      }

      if (variantError) {
        // O produto foi criado, mas sem cores/estoque: avisa em vez de falhar em silêncio
        console.error("Erro ao criar variações do produto:", variantError);
        postWarning = [
          postWarning,
          "O produto foi salvo, mas as cores/estoque NÃO foram gravados. Abra o produto na lista, confira as cores e salve de novo.",
        ]
          .filter(Boolean)
          .join(" ");
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

    revalidateProductPages(productData.slug);

    {
      const postVariantNames: string[] = Array.isArray(body.variants) && body.variants.length > 0
        ? body.variants.map((v: any) => String(v.color_name || v.name || "Padrão"))
        : [String(body.color_name || "Padrão")];
      const visibilityWarning = await verifyPublicVisibility(productId, {
        published: (body.is_published ?? true) === true,
        colors: postVariantNames,
        images: imagesToInsert.length,
      });
      if (visibilityWarning) postWarning = [postWarning, visibilityWarning].filter(Boolean).join(" ");
    }

    if (slugAdjusted) {
      postWarning = [
        postWarning,
        `Já existia um produto com esse nome, então este foi salvo com o endereço "${finalSlug}".`,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return NextResponse.json({
      success: true,
      product: productData,
      ...(postWarning ? { warning: postWarning } : {}),
    });
  } catch (err: any) {
    console.error("Erro interno no cadastro de produtos:", err);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar o produto. Tente de novo; se repetir, avise o suporte." },
      { status: 500 }
    );
  }
}

/**
 * Sincroniza as cores (variações) do produto com a lista enviada pelo admin:
 * atualiza as existentes (por id), cria as novas e remove as retiradas.
 * Variação já usada em pedido/estoque não pode ser apagada: fica indisponível.
 */
async function syncProductVariants(client: any, productId: string, product: any, list: any[]): Promise<string | undefined> {
  const problems: string[] = [];
  const now = new Date().toISOString();

  const { data: existing, error: loadError } = await client
    .from("product_variants")
    .select("id, sku")
    .eq("product_id", productId);
  if (loadError) {
    console.error("Erro ao carregar variações para sincronizar:", loadError.message);
    return "O produto foi salvo, mas as cores NÃO foram atualizadas (falha ao ler as cores atuais). Tente salvar de novo.";
  }

  const existingIds = new Set<string>((existing || []).map((v: { id: string }) => v.id));
  const keptIds = new Set<string>();
  const baseSku = String(product?.sku || `VEN-${productId.slice(0, 6).toUpperCase()}`).toUpperCase();

  for (let idx = 0; idx < list.length; idx++) {
    const v = list[idx] || {};
    const row = {
      color_name: String(v.color_name || "").trim() || "Padrão",
      color_hex: typeof v.color_hex === "string" && v.color_hex ? v.color_hex : "#0f172a",
      stock_quantity: typeof v.stock_quantity === "number" && v.stock_quantity >= 0 ? Math.floor(v.stock_quantity) : 0,
      is_available: v.is_available !== false,
      sort_order: idx,
      updated_at: now,
    };

    if (v.id && existingIds.has(v.id)) {
      keptIds.add(v.id);
      const { error } = await client.from("product_variants").update(row).eq("id", v.id);
      if (error) problems.push(`"${row.color_name}"`);
      continue;
    }

    // Nova cor: SKU único (tenta de novo com sufixo se já existir)
    const stamp = Date.now().toString(36).slice(-4).toUpperCase();
    const baseNewSku = `${baseSku}-${idx + 1}`;
    let { error } = await client.from("product_variants").insert({
      ...row,
      product_id: productId,
      sku: baseNewSku,
      size: "Único",
      price_in_cents: product?.price_in_cents ?? null,
      compare_at_price_in_cents: product?.compare_at_price_in_cents ?? null,
    });
    if (error && (error.code === "23505" || /duplicate key/i.test(error.message || ""))) {
      ({ error } = await client.from("product_variants").insert({
        ...row,
        product_id: productId,
        sku: `${baseNewSku}-${stamp}`,
        size: "Único",
        price_in_cents: product?.price_in_cents ?? null,
        compare_at_price_in_cents: product?.compare_at_price_in_cents ?? null,
      }));
    }
    if (error) {
      console.error("Erro ao criar variação:", error.message);
      problems.push(`"${row.color_name}"`);
    }
  }

  // Cores retiradas da lista
  for (const old of existingIds) {
    if (keptIds.has(old)) continue;
    const { error } = await client.from("product_variants").delete().eq("id", old);
    if (error) {
      // Já usada em pedido/estoque: mantém o histórico e tira da vitrine
      await client.from("product_variants").update({ is_available: false, stock_quantity: 0, updated_at: now }).eq("id", old);
    }
  }

  return problems.length > 0
    ? `O produto foi salvo, mas estas cores NÃO foram gravadas: ${problems.join(", ")}. Salve de novo ou avise o suporte.`
    : undefined;
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();
    const { id, images, imageUrls, imageUrl, stock_quantity, color_name, face_shape_fit, variants: variantsPayload, ...updates } = body;

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

    const faceWarning =
      face_shape_fit !== undefined ? await saveFaceFit(adminSupabase, id, face_shape_fit) : undefined;

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

    let patchWarning: string | undefined = faceWarning;
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
      if (imgResult.focusDropped) patchWarning = [patchWarning, FOCUS_SQL_WARNING].filter(Boolean).join(" ");
    }

    // Status coerente com is_published
    if (typeof updates.is_published === "boolean") {
      await syncPublishStatus(adminSupabase, id, updates.is_published);
    }

    // 3a. Lista completa de cores/variações enviada pelo editor: sincroniza (atualiza, cria e remove)
    const hasVariantsPayload = Array.isArray(variantsPayload) && variantsPayload.length > 0;
    if (hasVariantsPayload) {
      const variantWarning = await syncProductVariants(adminSupabase, id, updatedProduct, variantsPayload);
      if (variantWarning) patchWarning = [patchWarning, variantWarning].filter(Boolean).join(" ");
    }

    // 3b. Estoque/cor únicos (formulários antigos sem lista de variações)
    if (!hasVariantsPayload && (typeof stock_quantity === "number" || color_name)) {
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

    revalidateProductPages(updatedProduct?.slug);

    {
      const visibilityWarning = await verifyPublicVisibility(id, {
        published: (typeof updates.is_published === "boolean" ? updates.is_published : updatedProduct?.is_published) === true,
        colors: hasVariantsPayload
          ? variantsPayload
              .filter((v: any) => v?.is_available !== false)
              .map((v: any) => String(v.color_name || "").trim())
              .filter(Boolean)
          : undefined,
        images: newImages.length > 0 ? newImages.length : undefined,
      });
      if (visibilityWarning) patchWarning = [patchWarning, visibilityWarning].filter(Boolean).join(" ");
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

    revalidateProductPages();

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
