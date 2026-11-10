-- Migration: PDP Usability, Cart Dynamic Revalidation, Stepper Checkout, and Admin Settings
-- Created: 2026-11-10
-- Target: site-otica-ventara (Supabase Postgres)

-- 1. Campos adicionais na tabela 'products' para PDP avançada e controle de estoque
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS face_shape_recommendations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS warranty_text TEXT,
  ADD COLUMN IF NOT EXISTS exchange_text TEXT,
  ADD COLUMN IF NOT EXISTS faq_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits_tags TEXT[] DEFAULT '{}';

-- 2. Índices de otimização para consulta de produtos e variantes no carrinho
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);

-- 3. Atualização / Inserção dos dados institucionais da loja e configurações globais em 'site_settings'
INSERT INTO site_settings (key, value, updated_at)
VALUES 
  (
    'store_info',
    jsonb_build_object(
      'name', 'Ótica Ventara',
      'trade_name', 'Ventara Eyewear',
      'cnpj', '48.291.834/0001-90',
      'phone', '(18) 99615-5748',
      'whatsapp', '5518996155748',
      'email', 'contato@oticasventara.com.br',
      'address_street', 'Rua Princesa Isabel',
      'address_number', '221',
      'address_neighborhood', 'Centro',
      'address_city', 'Araçatuba',
      'address_state', 'SP',
      'address_cep', '16010-250',
      'business_hours', 'Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h'
    ),
    NOW()
  )
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = NOW();

INSERT INTO site_settings (key, value, updated_at)
VALUES 
  (
    'announcement_bar',
    jsonb_build_object(
      'is_active', false,
      'text', 'FRETE GRÁTIS PARA TODO O BRASIL NAS COMPRAS ACIMA DE R$ 350',
      'bg_color', '#06111F',
      'text_color', '#FFD62E',
      'start_date', null,
      'end_date', null
    ),
    NOW()
  )
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = NOW();

INSERT INTO site_settings (key, value, updated_at)
VALUES 
  (
    'benefits_bar',
    jsonb_build_array(
      jsonb_build_object('id', 'material', 'title', 'Acetato & Titânio Nobre', 'desc', 'Matéria-prima de alta durabilidade e conforto', 'icon', 'ShieldCheck', 'enabled', true),
      jsonb_build_object('id', 'lenses', 'title', 'Laboratório Próprio', 'desc', 'Montagem computadorizada em Araçatuba-SP', 'icon', 'Sparkles', 'enabled', true),
      jsonb_build_object('id', 'warranty', 'title', 'Garantia de 1 Ano', 'desc', 'Cobertura completa contra defeitos de fábrica', 'icon', 'Award', 'enabled', true),
      jsonb_build_object('id', 'exchange', 'title', 'Troca Facilitada', 'desc', '30 dias para experimentar com tranquilidade', 'icon', 'RefreshCw', 'enabled', true)
    ),
    NOW()
  )
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 4. Permissões de RLS para leitura pública das configurações gerais
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'site_settings' AND policyname = 'Public read for site settings'
  ) THEN
    CREATE POLICY "Public read for site settings" ON site_settings
      FOR SELECT USING (true);
  END IF;
END $$;
