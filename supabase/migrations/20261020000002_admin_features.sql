-- ============================================================================
-- MIGRATION: 20261020000002_admin_features.sql
-- PROJETO: Ótica Ventara — Banners, Configurações de Identidade e Estoque
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA: site_settings (Identidade Visual, Contatos e Configurações Gerais)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_settings_key ON public.site_settings(key);

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilita RLS em site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Visitantes e frontend público podem consultar configurações públicas
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Apenas administradores autenticados podem alterar configurações
CREATE POLICY "site_settings_admin_write"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. TABELA: homepage_banners (Banners Promocionais e Institucionais)
-- ----------------------------------------------------------------------------
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

CREATE INDEX idx_banners_sort_order ON public.homepage_banners(sort_order);
CREATE INDEX idx_banners_is_published ON public.homepage_banners(is_published);

CREATE TRIGGER set_homepage_banners_updated_at
  BEFORE UPDATE ON public.homepage_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilita RLS em homepage_banners
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

-- Visitantes podem visualizar banners publicados
CREATE POLICY "banners_public_read"
  ON public.homepage_banners
  FOR SELECT
  USING (is_published = true);

-- Administradores gerenciam banners
CREATE POLICY "banners_admin_all"
  ON public.homepage_banners
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. TABELA: inventory_movements (Histórico e Auditoria de Estoque)
-- ----------------------------------------------------------------------------
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

CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_variant ON public.inventory_movements(variant_id);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Habilita RLS em inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem visualizar e registrar movimentações de estoque
CREATE POLICY "inventory_movements_admin_all"
  ON public.inventory_movements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. SEED INICIAL: Identidade e Configurações Oficiais da Ótica Ventara
-- ----------------------------------------------------------------------------
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
