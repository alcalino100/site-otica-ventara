-- ============================================================================
-- SCHEMA COMPLETO E UNIFICADO — ÓTICA VENTARA
-- Copie e cole este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/yfokjztrhecjlijvmvmr/sql/new
-- ============================================================================

-- 0. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Funções Utilitárias
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Tabela: admin_profiles
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER set_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função de verificação de admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;

-- 3. Tabela: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Tabela: brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);

DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Tabela: products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_in_cents INTEGER NOT NULL CHECK (price_in_cents >= 0),
  compare_at_price_in_cents INTEGER CHECK (compare_at_price_in_cents IS NULL OR compare_at_price_in_cents >= 0),
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  frame_type TEXT NOT NULL DEFAULT 'Grau' CHECK (frame_type IN ('Grau', 'Solar', 'Clip-on')),
  frame_shape TEXT CHECK (frame_shape IN ('Quadrado', 'Redondo', 'Retangular', 'Gatinho', 'Aviador', 'Hexagonal', 'Oval', 'Outro')),
  frame_material TEXT CHECK (frame_material IN ('Acetato Premium', 'Metal Titânio', 'Injetado', 'Madeira / Misto', 'Outro')),
  gender TEXT NOT NULL DEFAULT 'Unissex' CHECK (gender IN ('Unissex', 'Feminino', 'Masculino', 'Infantil')),
  dimensions_lens_mm INTEGER,
  dimensions_bridge_mm INTEGER,
  dimensions_temple_mm INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Tabela: product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 7. Tabela: product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL DEFAULT 'Único',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Tabela: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_document TEXT,
  shipping_address JSONB,
  
  subtotal_in_cents INTEGER NOT NULL CHECK (subtotal_in_cents >= 0),
  shipping_fee_in_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee_in_cents >= 0),
  discount_in_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_in_cents >= 0),
  total_in_cents INTEGER NOT NULL CHECK (total_in_cents >= 0),

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'awaiting_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'whatsapp_assisted', 'in_store')),
  payment_gateway_id TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference_code ON public.orders(reference_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Tabela: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  color_name TEXT,
  unit_price_in_cents INTEGER NOT NULL CHECK (unit_price_in_cents >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price_in_cents INTEGER NOT NULL CHECK (total_price_in_cents >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 10. Tabela: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Tabela: homepage_banners
CREATE TABLE IF NOT EXISTS public.homepage_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  image_url_desktop TEXT NOT NULL,
  image_url_mobile TEXT,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_sort_order ON public.homepage_banners(sort_order);

DROP TRIGGER IF EXISTS set_homepage_banners_updated_at ON public.homepage_banners;
CREATE TRIGGER set_homepage_banners_updated_at
  BEFORE UPDATE ON public.homepage_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 12. Tabela: inventory_movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'order_fulfillment')),
  quantity INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON public.inventory_movements(product_id);

-- ============================================================================
-- HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público pode visualizar categorias ativas' AND tablename = 'categories') THEN
    CREATE POLICY "Público pode visualizar categorias ativas" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público pode visualizar marcas ativas' AND tablename = 'brands') THEN
    CREATE POLICY "Público pode visualizar marcas ativas" ON public.brands FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público pode visualizar produtos publicados' AND tablename = 'products') THEN
    CREATE POLICY "Público pode visualizar produtos publicados" ON public.products FOR SELECT USING (is_published = true OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público pode visualizar imagens de produtos publicados' AND tablename = 'product_images') THEN
    CREATE POLICY "Público pode visualizar imagens de produtos publicados" ON public.product_images FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público pode visualizar variantes de produtos publicados' AND tablename = 'product_variants') THEN
    CREATE POLICY "Público pode visualizar variantes de produtos publicados" ON public.product_variants FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'site_settings_public_read' AND tablename = 'site_settings') THEN
    CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'banners_public_read' AND tablename = 'homepage_banners') THEN
    CREATE POLICY "banners_public_read" ON public.homepage_banners FOR SELECT USING (is_published = true);
  END IF;

  -- Políticas Administrativas (Permissões de gerenciamento para administradores)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar categorias' AND tablename = 'categories') THEN
    CREATE POLICY "Admins podem gerenciar categorias" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar marcas' AND tablename = 'brands') THEN
    CREATE POLICY "Admins podem gerenciar marcas" ON public.brands FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar produtos' AND tablename = 'products') THEN
    CREATE POLICY "Admins podem gerenciar produtos" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar imagens de produtos' AND tablename = 'product_images') THEN
    CREATE POLICY "Admins podem gerenciar imagens de produtos" ON public.product_images FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar variantes de produtos' AND tablename = 'product_variants') THEN
    CREATE POLICY "Admins podem gerenciar variantes de produtos" ON public.product_variants FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar pedidos' AND tablename = 'orders') THEN
    CREATE POLICY "Admins podem gerenciar pedidos" ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar itens de pedidos' AND tablename = 'order_items') THEN
    CREATE POLICY "Admins podem gerenciar itens de pedidos" ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar site_settings' AND tablename = 'site_settings') THEN
    CREATE POLICY "Admins podem gerenciar site_settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar banners' AND tablename = 'homepage_banners') THEN
    CREATE POLICY "Admins podem gerenciar banners" ON public.homepage_banners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins podem gerenciar estoque' AND tablename = 'inventory_movements') THEN
    CREATE POLICY "Admins podem gerenciar estoque" ON public.inventory_movements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Storage: Bucket de Imagens de Produtos
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Imagens de produtos são publicamente visíveis' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Imagens de produtos são publicamente visíveis" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir upload no bucket product-images' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Permitir upload no bucket product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir update no bucket product-images' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Permitir update no bucket product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- SEED INICIAL DE DADOS DA ÓTICA VENTARA
-- ============================================================================

-- Configurações Institucionais
INSERT INTO public.site_settings (key, description, value)
VALUES
  (
    'identity',
    'Identidade da Marca, Contatos e Redes Sociais',
    jsonb_build_object(
      'store_name', 'Ótica Ventara',
      'tagline', 'Mais que óculos. Seu jeito de ver o mundo.',
      'address_street', 'Rua Princesa Isabel, 221',
      'address_neighborhood', 'Centro',
      'address_city', 'Araçatuba',
      'address_state', 'SP',
      'address_postal_code', '16010-250',
      'phone_whatsapp', '(18) 99615-5748',
      'instagram_handle', '@oticaventara',
      'business_hours', 'Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h'
    )
  ),
  (
    'appearance',
    'Paleta de Cores e Tokens Visuais',
    jsonb_build_object(
      'color_navy', '#06111F',
      'color_electric', '#0756B8',
      'color_yellow', '#FFD62E',
      'color_ice_white', '#F4F6FA'
    )
  ),
  (
    'shipping',
    'Regras de Frete e Retirada Presencial',
    jsonb_build_object(
      'store_pickup_enabled', true,
      'free_shipping_threshold_cents', 35000,
      'default_shipping_fee_cents', 2500,
      'pickup_address', 'Rua Princesa Isabel, 221, Centro, Araçatuba-SP'
    )
  )
ON CONFLICT (key) DO NOTHING;

-- Categorias Iniciais
INSERT INTO public.categories (id, name, slug, description, sort_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Grau', 'grau', 'Armações desenvolvidas para alta precisão dióptrica e conforto contínuo.', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Solar', 'solar', 'Proteção solar com filtros UVA/UVB avançados e design autoral.', 2)
ON CONFLICT (slug) DO NOTHING;

-- Marca Oficial
INSERT INTO public.brands (id, name, slug, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Ventara Eyewear', 'ventara', true)
ON CONFLICT (slug) DO NOTHING;

-- Produtos do Catálogo Oficial
INSERT INTO public.products (
  id, category_id, brand_id, name, slug, description,
  price_in_cents, compare_at_price_in_cents, is_published, is_featured,
  frame_type, frame_shape, frame_material, gender,
  dimensions_lens_mm, dimensions_bridge_mm, dimensions_temple_mm
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    COALESCE((SELECT id FROM public.categories WHERE slug = 'grau' LIMIT 1), 'c0000000-0000-0000-0000-000000000001'),
    COALESCE((SELECT id FROM public.brands WHERE slug = 'ventara' LIMIT 1), 'b0000000-0000-0000-0000-000000000001'),
    'Ventara Essencial',
    'ventara-essencial',
    'Armação atemporal em acetato premium polido à mão. Conforto ergonômico excepcional para uso durante todo o dia.',
    38900, 45900, true, true,
    'Grau', 'Quadrado', 'Acetato Premium', 'Unissex',
    52, 18, 145
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    COALESCE((SELECT id FROM public.categories WHERE slug = 'solar' LIMIT 1), 'c0000000-0000-0000-0000-000000000002'),
    COALESCE((SELECT id FROM public.brands WHERE slug = 'ventara' LIMIT 1), 'b0000000-0000-0000-0000-000000000001'),
    'Ventara Aurora',
    'ventara-aurora',
    'Óculos de sol contemporâneo com tonalidade âmbar translúcida e proteção UV400 completa.',
    44900, 52900, true, true,
    'Solar', 'Redondo', 'Acetato Premium', 'Unissex',
    50, 20, 145
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    COALESCE((SELECT id FROM public.categories WHERE slug = 'grau' LIMIT 1), 'c0000000-0000-0000-0000-000000000001'),
    COALESCE((SELECT id FROM public.brands WHERE slug = 'ventara' LIMIT 1), 'b0000000-0000-0000-0000-000000000001'),
    'Ventara Urbano',
    'ventara-urbano',
    'Linhas minimalistas em titânio ultraleve com acabamento grafite acetinado.',
    42900, NULL, true, false,
    'Grau', 'Redondo', 'Metal Titânio', 'Unissex',
    49, 21, 140
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    COALESCE((SELECT id FROM public.categories WHERE slug = 'solar' LIMIT 1), 'c0000000-0000-0000-0000-000000000002'),
    COALESCE((SELECT id FROM public.brands WHERE slug = 'ventara' LIMIT 1), 'b0000000-0000-0000-0000-000000000001'),
    'Ventara Horizonte',
    'ventara-horizonte',
    'Design aviador reinterpretado com estrutura de liga metálica leve e ponte dupla geométrica.',
    48900, NULL, true, true,
    'Solar', 'Aviador', 'Metal Titânio', 'Unissex',
    54, 19, 142
  )
ON CONFLICT (slug) DO NOTHING;

-- Variantes com Estoque Inicial
INSERT INTO public.product_variants (product_id, sku, color_name, color_hex, size, stock_quantity)
VALUES
  (
    COALESCE((SELECT id FROM public.products WHERE slug = 'ventara-essencial' LIMIT 1), '00000000-0000-0000-0000-000000000101'),
    'VEN-ESS-BLK', 'Preto Clássico', '#111827', 'Único (M)', 8
  ),
  (
    COALESCE((SELECT id FROM public.products WHERE slug = 'ventara-aurora' LIMIT 1), '00000000-0000-0000-0000-000000000102'),
    'VEN-AUR-AMB', 'Âmbar Translúcido', '#b45309', 'Único (M)', 6
  ),
  (
    COALESCE((SELECT id FROM public.products WHERE slug = 'ventara-urbano' LIMIT 1), '00000000-0000-0000-0000-000000000103'),
    'VEN-URB-GRA', 'Grafite Acetinado', '#334155', 'Único (M)', 4
  ),
  (
    COALESCE((SELECT id FROM public.products WHERE slug = 'ventara-horizonte' LIMIT 1), '00000000-0000-0000-0000-000000000104'),
    'VEN-HOR-GLD', 'Dourado Champagne', '#d97706', 'Único (M)', 5
  )
ON CONFLICT (sku) DO NOTHING;
