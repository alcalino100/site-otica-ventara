-- ============================================================================
-- MIGRATION: 20261020000001_ecommerce_foundation.sql
-- PROJETO: Ótica Ventara — Fundação do Banco de Dados e E-commerce
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- FUNÇÕES UTILITÁRIAS
-- ----------------------------------------------------------------------------

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. TABELA: admin_profiles (Perfis de Administradores)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger de updated_at para admin_profiles
CREATE TRIGGER set_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função de verificação de permissão administrativa (SECURITY DEFINER para prevenir escalação de privilégios)
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

-- ----------------------------------------------------------------------------
-- 2. TABELA: categories (Categorias: Grau, Solar, Infantil, etc.)
-- ----------------------------------------------------------------------------
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

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. TABELA: brands (Marcas / Linhas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brands_slug ON public.brands(slug);
CREATE INDEX idx_brands_is_active ON public.brands(is_active);

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. TABELA: products (Produtos / Armações)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_in_cents INTEGER NOT NULL CHECK (price_in_cents >= 0),
  compare_at_price_in_cents INTEGER CHECK (compare_at_price_in_cents IS NULL OR compare_at_price_in_cents >= 0),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Especificações Técnicas de Ótica
  frame_type TEXT NOT NULL DEFAULT 'Grau' CHECK (frame_type IN ('Grau', 'Solar', 'Clip-on')),
  frame_shape TEXT CHECK (frame_shape IN ('Quadrado', 'Redondo', 'Retangular', 'Gatinho', 'Aviador', 'Hexagonal', 'Oval', 'Outro')),
  frame_material TEXT CHECK (frame_material IN ('Acetato Premium', 'Metal Titânio', 'Injetado', 'Madeira / Misto', 'Outro')),
  gender TEXT NOT NULL DEFAULT 'Unissex' CHECK (gender IN ('Unissex', 'Feminino', 'Masculino', 'Infantil')),
  dimensions_lens_mm INTEGER CHECK (dimensions_lens_mm IS NULL OR dimensions_lens_mm > 0),
  dimensions_bridge_mm INTEGER CHECK (dimensions_bridge_mm IS NULL OR dimensions_bridge_mm > 0),
  dimensions_temple_mm INTEGER CHECK (dimensions_temple_mm IS NULL OR dimensions_temple_mm > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_is_published ON public.products(is_published);
CREATE INDEX idx_products_frame_type ON public.products(frame_type);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. TABELA: product_images (Galeria de Fotos do Produto)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_sort ON public.product_images(product_id, sort_order);

-- ----------------------------------------------------------------------------
-- 6. TABELA: product_variants (Variações de Cor, Tamanho e Estoque)
-- ----------------------------------------------------------------------------
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

CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. TABELA: orders (Pedidos do E-commerce)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_document TEXT, -- CPF quando aplicável
  shipping_address JSONB, -- { street, number, complement, neighborhood, city, state, postal_code }
  
  -- Valores em centavos inteiros para prevenir imprecisão de ponto flutuante
  subtotal_in_cents INTEGER NOT NULL CHECK (subtotal_in_cents >= 0),
  shipping_fee_in_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee_in_cents >= 0),
  discount_in_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_in_cents >= 0),
  total_in_cents INTEGER NOT NULL CHECK (total_in_cents >= 0),

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',            -- Aguardando checkout / contato
    'awaiting_payment',   -- Pix ou boleto gerado
    'paid',               -- Pagamento aprovado
    'preparing',          -- Armação em montagem de lentes
    'shipped',            -- Postado ou disponível para retirada
    'delivered',          -- Entregue
    'cancelled',          -- Cancelado
    'refunded'            -- Reembolsado
  )),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'whatsapp_assisted', 'in_store')),
  payment_gateway_id TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_reference_code ON public.orders(reference_code);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. TABELA: order_items (Itens do Pedido com Preço Congelado)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  -- Dados congelados no momento da compra
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  color_name TEXT,
  unit_price_in_cents INTEGER NOT NULL CHECK (unit_price_in_cents >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price_in_cents INTEGER NOT NULL CHECK (total_price_in_cents >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ============================================================================
-- SEGURANÇA: HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLÍTICAS: admin_profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins podem visualizar perfis administrativos"
  ON public.admin_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Apenas super_admin pode inserir ou modificar administradores"
  ON public.admin_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ----------------------------------------------------------------------------
-- POLÍTICAS: categories
-- ----------------------------------------------------------------------------
CREATE POLICY "Público pode visualizar categorias ativas"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins podem gerenciar categorias"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLÍTICAS: brands
-- ----------------------------------------------------------------------------
CREATE POLICY "Público pode visualizar marcas ativas"
  ON public.brands FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins podem gerenciar marcas"
  ON public.brands FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLÍTICAS: products
-- ----------------------------------------------------------------------------
CREATE POLICY "Público pode visualizar produtos publicados"
  ON public.products FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins podem gerenciar produtos"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLÍTICAS: product_images
-- ----------------------------------------------------------------------------
CREATE POLICY "Público pode visualizar imagens de produtos publicados"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins podem gerenciar imagens de produtos"
  ON public.product_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLÍTICAS: product_variants
-- ----------------------------------------------------------------------------
CREATE POLICY "Público pode visualizar variantes de produtos publicados"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND (p.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins podem gerenciar variantes de produtos"
  ON public.product_variants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLÍTICAS: orders e order_items
-- ----------------------------------------------------------------------------
-- Usuários públicos NÃO possuem SELECT direto em pedidos (evita vazamento de dados de clientes).
-- Consultas de pedido acontecem via Server Actions com validação por token ou código de referência.
CREATE POLICY "Admins podem visualizar todos os pedidos"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem atualizar pedidos"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem visualizar todos os itens de pedidos"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- STORAGE: BUCKET DE IMAGENS DE PRODUTOS
-- ============================================================================
-- Criação do bucket se não existir no schema storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Imagens de produtos são publicamente visíveis"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins autenticados podem fazer upload de imagens de produtos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins autenticados podem atualizar imagens de produtos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins autenticados podem remover imagens de produtos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());
