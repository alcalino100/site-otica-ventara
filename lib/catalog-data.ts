import { Product } from "@/types/ecommerce";

export const DEFAULT_CATALOG: Product[] = [
  {
    "id": "46e75128-ad37-481b-94fb-59b824770ad5",
    "category_id": "c0000000-0000-0000-0000-000000000001",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "VENTARA SAFARI",
    "slug": "ventara-safari",
    "description": "Armação Onsa em acetato: design moderno, acabamento sofisticado e conforto para o seu dia a dia.",
    "price_in_cents": 38900,
    "compare_at_price_in_cents": 58990,
    "is_published": true,
    "is_featured": true,
    "frame_type": "Grau",
    "frame_shape": "Gatinho",
    "frame_material": "Acetato Premium",
    "gender": "Feminino",
    "dimensions_lens_mm": 53,
    "dimensions_bridge_mm": 18,
    "dimensions_temple_mm": 145,
    "created_at": "2026-10-23T18:00:16.197574+00:00",
    "updated_at": "2026-10-24T23:14:12.837682+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Grau",
      "slug": "grau",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 1,
      "updated_at": "2026-10-22T17:58:15.340256+00:00",
      "description": "Armações desenvolvidas para alta precisão dióptrica e conforto contínuo."
    },
    "images": [
      {
        "id": "e3a500c2-c627-4b99-8535-6468dca98b79",
        "url": "https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792778393371-a3xj7o.jpg",
        "alt_text": "VENTARA SAFARI",
        "created_at": "2026-10-23T18:00:16.39296+00:00",
        "is_primary": true,
        "product_id": "46e75128-ad37-481b-94fb-59b824770ad5",
        "sort_order": 0
      }
    ],
    "variants": [
      {
        "id": "435b2b40-43c2-4784-b268-3dfe0069618f",
        "sku": "VEN-VENTARAS-879",
        "size": "Único",
        "color_hex": null,
        "color_name": "Preto Clássico",
        "created_at": "2026-10-23T18:00:16.531671+00:00",
        "product_id": "46e75128-ad37-481b-94fb-59b824770ad5",
        "updated_at": "2026-10-23T18:00:16.531671+00:00",
        "stock_quantity": 5
      }
    ]
  },
  {
    "id": "1c5ad0ea-a244-4c1c-8c51-6dd869a0bc67",
    "category_id": "c0000000-0000-0000-0000-000000000001",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Onça",
    "slug": "ventara-onca",
    "description": null,
    "price_in_cents": 38990,
    "compare_at_price_in_cents": 44990,
    "is_published": true,
    "is_featured": true,
    "frame_type": "Grau",
    "frame_shape": "Redondo",
    "frame_material": "Acetato Premium",
    "gender": "Feminino",
    "dimensions_lens_mm": 53,
    "dimensions_bridge_mm": 18,
    "dimensions_temple_mm": 145,
    "created_at": "2026-10-23T00:54:01.922839+00:00",
    "updated_at": "2026-10-23T17:47:58.823434+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Grau",
      "slug": "grau",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 1,
      "updated_at": "2026-10-22T17:58:15.340256+00:00",
      "description": "Armações desenvolvidas para alta precisão dióptrica e conforto contínuo."
    },
    "images": [
      {
        "id": "c193aa36-6606-4159-839f-10d35ce30485",
        "url": "https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792716830393-u708m6.jpg",
        "alt_text": "Ventara Onça",
        "created_at": "2026-10-23T00:54:02.024069+00:00",
        "is_primary": true,
        "product_id": "1c5ad0ea-a244-4c1c-8c51-6dd869a0bc67",
        "sort_order": 0
      }
    ],
    "variants": [
      {
        "id": "341d8499-f7ff-4f60-b2e9-2c0d2688da66",
        "sku": "VEN-VENTARAO-822",
        "size": "Único",
        "color_hex": null,
        "color_name": "Onça",
        "created_at": "2026-10-23T00:54:02.137049+00:00",
        "product_id": "1c5ad0ea-a244-4c1c-8c51-6dd869a0bc67",
        "updated_at": "2026-10-23T00:54:02.137049+00:00",
        "stock_quantity": 10
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000106",
    "category_id": "c0000000-0000-0000-0000-000000000003",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Kids Solar UV400",
    "slug": "ventara-kids-solar",
    "description": "Óculos solar infantil emborrachado com proteção UV400 máxima e lentes polarizadas que eliminam reflexos na praia, piscina e passeios ao sol. Estrutura flexível e leve que resiste a torções sem quebrar.",
    "price_in_cents": 24900,
    "compare_at_price_in_cents": 29900,
    "is_published": true,
    "is_featured": false,
    "frame_type": "Solar",
    "frame_shape": "Redondo",
    "frame_material": "Injetado",
    "gender": "Infantil",
    "dimensions_lens_mm": 44,
    "dimensions_bridge_mm": 15,
    "dimensions_temple_mm": 125,
    "created_at": "2026-10-22T17:58:18.276656+00:00",
    "updated_at": "2026-10-24T23:14:14.969262+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000003",
      "name": "Infantil",
      "slug": "infantil",
      "is_active": true,
      "created_at": "2026-10-22T17:58:16.280096+00:00",
      "sort_order": 3,
      "updated_at": "2026-10-22T17:58:16.280096+00:00",
      "description": "Armações infantis com tecnologia flexível, alta resistência a impactos e ergonomia para crianças."
    },
    "images": [],
    "variants": [
      {
        "id": "1211539f-a625-4d56-bf63-472709bf2b0d",
        "sku": "VEN-KID-SOL-CYN",
        "size": "Infantil (3 a 9 anos)",
        "color_hex": "#06b6d4",
        "color_name": "Turquesa Vibrante",
        "created_at": "2026-10-22T17:58:20.342786+00:00",
        "product_id": "00000000-0000-0000-0000-000000000106",
        "updated_at": "2026-10-22T17:58:20.342786+00:00",
        "stock_quantity": 6
      },
      {
        "id": "d34298cb-2a99-4782-b45d-616ee065b423",
        "sku": "VEN-KID-SOL-RED",
        "size": "Infantil (3 a 9 anos)",
        "color_hex": "#dc2626",
        "color_name": "Vermelho Esportivo",
        "created_at": "2026-10-22T17:58:20.649389+00:00",
        "product_id": "00000000-0000-0000-0000-000000000106",
        "updated_at": "2026-10-22T17:58:20.649389+00:00",
        "stock_quantity": 4
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000105",
    "category_id": "c0000000-0000-0000-0000-000000000003",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Kids Flex",
    "slug": "ventara-kids-flex",
    "description": "Armação infantil desenvolvida em TR90 e silicone cirúrgico flexível ultra-resistente. Haste anatômica que não escorrega, ponteira macia e total segurança sem peças rígidas cortantes. Ideal para brincadeiras e uso escolar diário.",
    "price_in_cents": 28900,
    "compare_at_price_in_cents": 34900,
    "is_published": true,
    "is_featured": false,
    "frame_type": "Grau",
    "frame_shape": "Redondo",
    "frame_material": "Injetado",
    "gender": "Infantil",
    "dimensions_lens_mm": 45,
    "dimensions_bridge_mm": 16,
    "dimensions_temple_mm": 130,
    "created_at": "2026-10-22T17:58:18.106384+00:00",
    "updated_at": "2026-10-24T23:14:15.792026+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000003",
      "name": "Infantil",
      "slug": "infantil",
      "is_active": true,
      "created_at": "2026-10-22T17:58:16.280096+00:00",
      "sort_order": 3,
      "updated_at": "2026-10-22T17:58:16.280096+00:00",
      "description": "Armações infantis com tecnologia flexível, alta resistência a impactos e ergonomia para crianças."
    },
    "images": [],
    "variants": [
      {
        "id": "3d7a1b56-63f8-4d43-8837-86393939ea34",
        "sku": "VEN-KID-BLU",
        "size": "Infantil (4 a 10 anos)",
        "color_hex": "#2563eb",
        "color_name": "Azul Royal",
        "created_at": "2026-10-22T17:58:19.718035+00:00",
        "product_id": "00000000-0000-0000-0000-000000000105",
        "updated_at": "2026-10-22T17:58:19.718035+00:00",
        "stock_quantity": 6
      },
      {
        "id": "123b55d5-3c08-40ea-9798-ff5754356b04",
        "sku": "VEN-KID-ROS",
        "size": "Infantil (4 a 10 anos)",
        "color_hex": "#ec4899",
        "color_name": "Rosa Chiclete",
        "created_at": "2026-10-22T17:58:19.89024+00:00",
        "product_id": "00000000-0000-0000-0000-000000000105",
        "updated_at": "2026-10-22T17:58:19.89024+00:00",
        "stock_quantity": 5
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000101",
    "category_id": "c0000000-0000-0000-0000-000000000001",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Essencial",
    "slug": "ventara-essencial",
    "description": "Armação atemporal em acetato premium polido à mão. Conforto ergonômico excepcional para uso durante todo o dia, ponte anatômica e compatibilidade total com lentes multifocais e antirreflexo.",
    "price_in_cents": 38900,
    "compare_at_price_in_cents": 45900,
    "is_published": true,
    "is_featured": false,
    "frame_type": "Grau",
    "frame_shape": "Quadrado",
    "frame_material": "Acetato Premium",
    "gender": "Unissex",
    "dimensions_lens_mm": 52,
    "dimensions_bridge_mm": 18,
    "dimensions_temple_mm": 145,
    "created_at": "2026-10-22T17:58:16.665942+00:00",
    "updated_at": "2026-10-24T23:14:16.410009+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Grau",
      "slug": "grau",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 1,
      "updated_at": "2026-10-22T17:58:15.340256+00:00",
      "description": "Armações desenvolvidas para alta precisão dióptrica e conforto contínuo."
    },
    "images": [],
    "variants": [
      {
        "id": "0258791f-630a-470a-8795-0f43e86bbd18",
        "sku": "VEN-ESS-BLK",
        "size": "Único (M)",
        "color_hex": "#111827",
        "color_name": "Preto Clássico",
        "created_at": "2026-10-22T17:58:18.523315+00:00",
        "product_id": "00000000-0000-0000-0000-000000000101",
        "updated_at": "2026-10-22T17:58:18.523315+00:00",
        "stock_quantity": 8
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000104",
    "category_id": "c0000000-0000-0000-0000-000000000002",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Horizonte Sport",
    "slug": "ventara-horizonte-sport",
    "description": "Óculos solar esportivo de alta performance com lente panorâmica espelhada Fire Red UV400, haste anatômica com gravação Ventara e armação ultraleve para ciclismo, corrida e velocidade.",
    "price_in_cents": 46900,
    "compare_at_price_in_cents": 55000,
    "is_published": true,
    "is_featured": true,
    "frame_type": "Solar",
    "frame_shape": "Aviador",
    "frame_material": "Injetado",
    "gender": "Unissex",
    "dimensions_lens_mm": 65,
    "dimensions_bridge_mm": 14,
    "dimensions_temple_mm": 138,
    "created_at": "2026-10-20T22:50:16.86051+00:00",
    "updated_at": "2026-10-22T18:58:14.561659+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000002",
      "name": "Solar",
      "slug": "solar",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 2,
      "updated_at": "2026-10-22T17:58:15.842619+00:00",
      "description": "Proteção solar com filtros UVA/UVB avançados e design autoral."
    },
    "images": [
      {
        "id": "img-ventara-horizonte-sport-1",
        "url": "/images/products/ventara-sport-fire.jpg",
        "product_id": "00000000-0000-0000-0000-000000000104",
        "is_primary": true,
        "sort_order": 1,
        "alt_text": "Óculos Solar Esportivo Ventara Horizonte Lente Fire Espelhada UV400",
        "created_at": "2026-10-26T22:50:16.86051+00:00"
      }
    ],
    "variants": [
      {
        "id": "var-ventara-horizonte-fire",
        "sku": "VEN-HOR-FIRE",
        "size": "Esportivo Envolvente",
        "color_hex": "#ea580c",
        "color_name": "Lente Fire Vermelha Espelhada",
        "created_at": "2026-10-26T22:50:16.86051+00:00",
        "product_id": "00000000-0000-0000-0000-000000000104",
        "updated_at": "2026-10-26T22:50:16.86051+00:00",
        "stock_quantity": 6
      },
      {
        "id": "1209757d-5563-4f93-8e08-e8b689c61ffd",
        "sku": "VEN-HOR-GLD",
        "size": "Único (G)",
        "color_hex": "#d97706",
        "color_name": "Preto e Dourado",
        "created_at": "2026-10-20T22:50:16.86051+00:00",
        "product_id": "00000000-0000-0000-0000-000000000104",
        "updated_at": "2026-10-22T17:58:19.400989+00:00",
        "stock_quantity": 5
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000102",
    "category_id": "c0000000-0000-0000-0000-000000000002",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Aurora",
    "slug": "ventara-aurora",
    "description": "Óculos de sol contemporâneo com tonalidade âmbar translúcida e proteção UV400 completa. Lentes solares de alto contraste que preservam a fidelidade de cores em ambientes abertos.",
    "price_in_cents": 44900,
    "compare_at_price_in_cents": 52900,
    "is_published": true,
    "is_featured": false,
    "frame_type": "Solar",
    "frame_shape": "Redondo",
    "frame_material": "Acetato Premium",
    "gender": "Unissex",
    "dimensions_lens_mm": 50,
    "dimensions_bridge_mm": 20,
    "dimensions_temple_mm": 145,
    "created_at": "2026-10-20T22:50:16.86051+00:00",
    "updated_at": "2026-10-23T15:48:23.112099+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000002",
      "name": "Solar",
      "slug": "solar",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 2,
      "updated_at": "2026-10-22T17:58:15.842619+00:00",
      "description": "Proteção solar com filtros UVA/UVB avançados e design autoral."
    },
    "images": [],
    "variants": [
      {
        "id": "5fcd3328-f837-4d1d-bd69-d0cd59ad9e6c",
        "sku": "VEN-AUR-AMB",
        "size": "Único (M)",
        "color_hex": "#b45309",
        "color_name": "Âmbar Translúcido",
        "created_at": "2026-10-20T22:50:16.86051+00:00",
        "product_id": "00000000-0000-0000-0000-000000000102",
        "updated_at": "2026-10-22T17:58:18.7292+00:00",
        "stock_quantity": 6
      }
    ]
  },
  {
    "id": "00000000-0000-0000-0000-000000000103",
    "category_id": "c0000000-0000-0000-0000-000000000001",
    "brand_id": "b0000000-0000-0000-0000-000000000001",
    "name": "Ventara Urbano",
    "slug": "ventara-urbano",
    "description": "Linhas minimalistas em titânio ultraleve com acabamento grafite acetinado. Ideal para quem valoriza discrição, leveza estrutural na face e resistência à corrosão.",
    "price_in_cents": 42900,
    "compare_at_price_in_cents": null,
    "is_published": true,
    "is_featured": false,
    "frame_type": "Grau",
    "frame_shape": "Redondo",
    "frame_material": "Metal Titânio",
    "gender": "Unissex",
    "dimensions_lens_mm": 49,
    "dimensions_bridge_mm": 21,
    "dimensions_temple_mm": 140,
    "created_at": "2026-10-20T22:50:16.86051+00:00",
    "updated_at": "2026-10-22T18:58:13.799233+00:00",
    "category": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Grau",
      "slug": "grau",
      "is_active": true,
      "created_at": "2026-10-20T22:50:16.86051+00:00",
      "sort_order": 1,
      "updated_at": "2026-10-22T17:58:15.340256+00:00",
      "description": "Armações desenvolvidas para alta precisão dióptrica e conforto contínuo."
    },
    "images": [],
    "variants": [
      {
        "id": "65d89756-fc7e-4391-bfcc-d1e91332428d",
        "sku": "VEN-URB-GRF",
        "size": "Único (M)",
        "color_hex": "#374151",
        "color_name": "Grafite Fosco",
        "created_at": "2026-10-22T17:58:19.176777+00:00",
        "product_id": "00000000-0000-0000-0000-000000000103",
        "updated_at": "2026-10-23T15:52:29.357182+00:00",
        "stock_quantity": 1
      }
    ]
  }
];
