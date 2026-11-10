/**
 * Script de Auditoria de Integridade de Dados — Ótica Ventara (SOMENTE LEITURA)
 * 
 * Verifica:
 * 1. Produtos com a mesma foto
 * 2. Produtos com mesmo nome e fotos ou descrições diferentes (ex: múltiplos "VENTARA SAFARI")
 * 3. Produtos sem SKU
 * 4. Produtos com preço original menor ou igual ao preço atual
 * 5. Produtos com desconto ativo que não aparecem em Ofertas
 * 
 * Gera: relatorio-auditoria-produtos-ventara.csv
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Carregar variáveis do .env.local se disponível
let env = {};
try {
  const envLocal = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  envLocal.split("\n").forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
} catch {
  // Ignora se não existir
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://yfokjztrhecjlijvmvmr.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=== INICIANDO AUDITORIA DE INTEGRIDADE DE DADOS (ÓTICA VENTARA) ===");
  console.log("Conectado ao Supabase:", supabaseUrl);

  const findings = [];

  // 1. Carregar todos os produtos e suas imagens e variantes do banco de forma segura
  const { data: dbProducts, error: prodErr } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price_in_cents,
      compare_at_price_in_cents,
      description,
      is_published,
      is_featured,
      images:product_images(id, url, is_primary),
      variants:product_variants(id, sku, color_name)
    `);

  if (prodErr) {
    console.error("Erro ao carregar produtos:", prodErr.message);
  }

  // 2. Carregar configurações de vitrine de ofertas
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("key", "promotional_showcase")
    .single();

  const promoItems = settingsData?.value?.items || [];
  const promoSlugs = new Set(promoItems.map((it) => it.slug).filter(Boolean));
  const promoProductIds = new Set(promoItems.map((it) => it.id).filter(Boolean));

  // 3. Fallback de catálogo se DB estiver vazio
  let allAudited = dbProducts || [];
  if (allAudited.length === 0) {
    try {
      const catFile = fs.readFileSync(path.join(__dirname, "..", "lib", "catalog-data.ts"), "utf8");
      const match = catFile.match(/export const DEFAULT_CATALOG: Product\[\] = (\[[\s\S]*?\]);/);
      if (match) {
        allAudited = eval(match[1]);
      }
    } catch (err) {
      console.warn("Aviso ao ler catalog-data.ts:", err.message);
    }
  }

  console.log(`Analisando ${allAudited.length} produtos e ${promoItems.length} itens de vitrine...`);

  // --- REGRA A: Produtos sem SKU ---
  allAudited.forEach((p) => {
    if (!p.sku || p.sku.trim() === "") {
      findings.push({
        tipo_problema: "PRODUTO_SEM_SKU",
        severidade: "ALTA",
        produto_id: p.id,
        nome_produto: p.name,
        slug: p.slug,
        detalhe: "Produto não possui SKU cadastrado. Essencial para controle de estoque e fotos.",
        recomendacao: "Gerar SKU único (ex: VEN-" + (p.slug || "ITEM").toUpperCase().slice(0, 8) + ").",
      });
    }
  });

  // --- REGRA B: Preço original menor ou igual ao preço atual ---
  allAudited.forEach((p) => {
    const price = p.price_in_cents || (p.price ? p.price * 100 : 0);
    const compare = p.compare_at_price_in_cents || (p.compare_at_price ? p.compare_at_price * 100 : null);
    if (compare && compare <= price) {
      findings.push({
        tipo_problema: "PRECO_ORIGINAL_INVALIDO",
        severidade: "MEDIA",
        produto_id: p.id,
        nome_produto: p.name,
        slug: p.slug,
        detalhe: `Preço original (R$ ${(compare/100).toFixed(2)}) é menor ou igual ao atual (R$ ${(price/100).toFixed(2)}). Desconto negativo ou zerado.`,
        recomendacao: "Corrigir o preço 'De' para ser maior que o preço 'Por', ou remover o compare_at_price.",
      });
    }
  });

  // --- REGRA C: Produtos com desconto que não aparecem em 'Ofertas' ---
  allAudited.forEach((p) => {
    const price = p.price_in_cents || (p.price ? p.price * 100 : 0);
    const compare = p.compare_at_price_in_cents || (p.compare_at_price ? p.compare_at_price * 100 : null);
    const hasDiscount = compare && compare > price;
    const inPromo = promoSlugs.has(p.slug) || promoProductIds.has(p.id);

    if (hasDiscount && !inPromo) {
      findings.push({
        tipo_problema: "DESCONTO_FORA_DE_OFERTAS",
        severidade: "BAIXA",
        produto_id: p.id,
        nome_produto: p.name,
        slug: p.slug,
        detalhe: `Possui desconto de ${Math.round(100 * (compare - price) / compare)}% mas não está vinculado à seção de Ofertas da home.`,
        recomendacao: "Adicionar o produto à vitrine de ofertas ou ativar inclusão automática.",
      });
    }
  });

  // --- REGRA D: Produtos com mesma foto (duplicação de mídia) ---
  const photoToProducts = new Map();
  allAudited.forEach((p) => {
    const primaryImg = p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url || p.image;
    if (primaryImg) {
      if (!photoToProducts.has(primaryImg)) {
        photoToProducts.set(primaryImg, []);
      }
      photoToProducts.get(primaryImg).push(p);
    }
  });

  photoToProducts.forEach((prods, url) => {
    if (prods.length > 1) {
      findings.push({
        tipo_problema: "FOTO_DUPLICADA_ENTRE_PRODUTOS",
        severidade: "ALTA",
        produto_id: prods.map((p) => p.id).join(" | "),
        nome_produto: prods.map((p) => p.name).join(" | "),
        slug: prods.map((p) => p.slug).join(" | "),
        detalhe: `A mesma URL de imagem (${url.slice(0, 60)}...) é usada em ${prods.length} produtos diferentes.`,
        recomendacao: "Vincular fotos reais exclusivas para cada armação pelo upload em lote.",
      });
    }
  });

  // --- REGRA E: Itens com mesmo nome e fotos/descrições divergentes na Vitrine / DB ---
  // (Identificação específica do caso dos múltiplos "VENTARA SAFARI" ou "Novo Modelo em Oferta")
  const promoNameMap = new Map();
  promoItems.forEach((it, index) => {
    const name = (it.name || "").trim().toUpperCase();
    if (!promoNameMap.has(name)) {
      promoNameMap.set(name, []);
    }
    promoNameMap.get(name).push({ ...it, vitrine_pos: index + 1 });
  });

  promoNameMap.forEach((items, name) => {
    if (items.length > 1) {
      const distinctImages = new Set(items.map((i) => i.image).filter(Boolean));
      const distinctDescriptions = new Set(items.map((i) => i.description).filter(Boolean));
      findings.push({
        tipo_problema: "PRODUTOS_HOMONIMOS_COM_DADOS_DIVERGENTES",
        severidade: "CRITICA",
        produto_id: items.map((i) => i.id).join(" | "),
        nome_produto: name,
        slug: items.map((i) => i.slug).join(" | "),
        detalhe: `Existem ${items.length} cards na vitrine com o mesmo nome '${name}', mas com ${distinctImages.size} fotos distintas e ${distinctDescriptions.size} descrições diferentes. Caso clássico dos cards Safari/Novo Modelo associados por posição.`,
        recomendacao: "Cada item deve referenciar um produto único no banco de dados com seu próprio nome e foto, ou tornarem-se variações de um mesmo modelo.",
      });
    }
  });

  // 4. Gerar CSV
  const csvHeaders = ["tipo_problema", "severidade", "produto_id", "nome_produto", "slug", "detalhe", "recomendacao"];
  const csvRows = findings.map((f) =>
    csvHeaders
      .map((h) => {
        const val = (f[h] || "").toString().replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(",")
  );

  const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
  const outputPath = path.join(__dirname, "..", "auditoria-produtos-ventara.csv");
  fs.writeFileSync(outputPath, csvContent, "utf8");

  console.log(`\n✓ Auditoria concluída! Encontrados ${findings.length} apontamentos.`);
  console.log(`✓ Relatório salvo em: ${outputPath}`);

  console.log("\nResumo dos Achados por Tipo:");
  const summary = {};
  findings.forEach((f) => {
    summary[f.tipo_problema] = (summary[f.tipo_problema] || 0) + 1;
  });
  console.table(summary);
}

runAudit().catch(console.error);
