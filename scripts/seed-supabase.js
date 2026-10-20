/**
 * Script de Seed e Sincronização do Supabase para Ótica Ventara
 * Utiliza a service_role key para popular categorias, marcas e produtos iniciais.
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yfokjztrhecjlijvmvmr.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmb2tqenRyaGVjamxpanZtdm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjUyODU0NywiZXhwIjoyMTA4MTA0NTQ3fQ.G4s3-GD1psw_jkd1uTh_CVdX7K132Ka_1QH--CWElHA";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runSeed() {
  console.log("Conectando ao Supabase:", supabaseUrl);

  // 1. Categorias
  console.log("Semeando categorias...");
  const categories = [
    { name: "Grau", slug: "grau", description: "Armações para lentes de grau de alta precisão.", sort_order: 1 },
    { name: "Solar", slug: "solar", description: "Óculos de sol com proteção UVA/UVB avançada.", sort_order: 2 }
  ];

  for (const cat of categories) {
    const { error } = await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
    if (error) console.error("Erro na categoria", cat.slug, error.message);
  }

  // Busca IDs das categorias
  const { data: dbCategories } = await supabase.from("categories").select("id, slug");
  const grauId = dbCategories?.find(c => c.slug === "grau")?.id;
  const solarId = dbCategories?.find(c => c.slug === "solar")?.id;

  // 2. Marca Ventara
  console.log("Semeando marca oficial...");
  const { data: brandData, error: brandErr } = await supabase
    .from("brands")
    .upsert({ name: "Ventara Eyewear", slug: "ventara", is_active: true }, { onConflict: "slug" })
    .select()
    .single();

  const brandId = brandData?.id;

  // 3. Produtos estruturados
  console.log("Semeando catálogo de armações...");
  const products = [
    {
      name: "Ventara Essencial",
      slug: "ventara-essencial",
      category_id: grauId,
      brand_id: brandId,
      description: "Armação atemporal em acetato premium polido à mão. Conforto ergonômico excepcional para uso durante todo o dia.",
      price_in_cents: 38900,
      compare_at_price_in_cents: 45900,
      is_published: true,
      is_featured: true,
      frame_type: "Grau",
      frame_shape: "Quadrado",
      frame_material: "Acetato Premium",
      gender: "Unissex",
      dimensions_lens_mm: 52,
      dimensions_bridge_mm: 18,
      dimensions_temple_mm: 145,
    },
    {
      name: "Ventara Aurora",
      slug: "ventara-aurora",
      category_id: solarId,
      brand_id: brandId,
      description: "Óculos de sol contemporâneo com tonalidade âmbar translúcida e proteção UV400 completa.",
      price_in_cents: 44900,
      compare_at_price_in_cents: 52900,
      is_published: true,
      is_featured: true,
      frame_type: "Solar",
      frame_shape: "Redondo",
      frame_material: "Acetato Premium",
      gender: "Unissex",
      dimensions_lens_mm: 50,
      dimensions_bridge_mm: 20,
      dimensions_temple_mm: 145,
    },
    {
      name: "Ventara Urbano",
      slug: "ventara-urbano",
      category_id: grauId,
      brand_id: brandId,
      description: "Linhas minimalistas em titânio ultraleve com acabamento grafite acetinado.",
      price_in_cents: 42900,
      compare_at_price_in_cents: null,
      is_published: true,
      is_featured: false,
      frame_type: "Grau",
      frame_shape: "Redondo",
      frame_material: "Metal Titânio",
      gender: "Unissex",
      dimensions_lens_mm: 49,
      dimensions_bridge_mm: 21,
      dimensions_temple_mm: 140,
    },
    {
      name: "Ventara Horizonte",
      slug: "ventara-horizonte",
      category_id: solarId,
      brand_id: brandId,
      description: "Design aviador reinterpretado com estrutura de liga metálica leve e ponte dupla geométrica.",
      price_in_cents: 48900,
      compare_at_price_in_cents: null,
      is_published: true,
      is_featured: true,
      frame_type: "Solar",
      frame_shape: "Aviador",
      frame_material: "Metal Titânio",
      gender: "Unissex",
      dimensions_lens_mm: 54,
      dimensions_bridge_mm: 19,
      dimensions_temple_mm: 142,
    }
  ];

  for (const prod of products) {
    const { data: pData, error: pErr } = await supabase
      .from("products")
      .upsert(prod, { onConflict: "slug" })
      .select()
      .single();

    if (pErr) {
      console.error("Erro no produto", prod.slug, pErr.message);
      continue;
    }

    // Variação padrão
    let colorName = "Preto Clássico";
    let colorHex = "#111827";
    let sku = `VEN-${prod.slug.toUpperCase().slice(8, 11)}-01`;

    if (prod.slug.includes("aurora")) {
      colorName = "Âmbar Translúcido";
      colorHex = "#b45309";
    } else if (prod.slug.includes("urbano")) {
      colorName = "Grafite Acetinado";
      colorHex = "#334155";
    } else if (prod.slug.includes("horizonte")) {
      colorName = "Dourado Champagne";
      colorHex = "#d97706";
    }

    await supabase.from("product_variants").upsert({
      product_id: pData.id,
      sku: sku,
      color_name: colorName,
      color_hex: colorHex,
      size: "Único (M)",
      stock_quantity: 10
    }, { onConflict: "sku" });
  }

  console.log("Seed concluído com sucesso!");
}

runSeed().catch(console.error);
