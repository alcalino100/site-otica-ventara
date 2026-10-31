-- ============================================================================
-- MIGRATION: 20261031000002_add_original_price_to_lenses_and_products.sql
-- PROJETO: Ótica Ventara — Preço Original e Promoções em Lentes e Produtos
-- ============================================================================

-- 1. ADICIONA COLUNA original_price NA TABELA products (SE AINDA NÃO EXISTIR)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);

-- Preenche retroativamente caso exista compare_at_price_in_cents e original_price seja nulo
UPDATE public.products 
SET original_price = ROUND((compare_at_price_in_cents / 100.0)::numeric, 2)
WHERE compare_at_price_in_cents IS NOT NULL AND original_price IS NULL;

-- 2. CRIA / ATUALIZA TABELA DEDICADA public.lenses
CREATE TABLE IF NOT EXISTS public.lenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'visao-simples',
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  box_image TEXT,
  treatment TEXT,
  badge TEXT,
  starting_price TEXT NOT NULL,
  original_price NUMERIC(10, 2),
  show_discount_badge BOOLEAN NOT NULL DEFAULT true,
  installment TEXT,
  lead_time TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color_hex TEXT,
  lens_color_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona a coluna original_price se a tabela já existia sem ela
ALTER TABLE public.lenses
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);

ALTER TABLE public.lenses
ADD COLUMN IF NOT EXISTS show_discount_badge BOOLEAN NOT NULL DEFAULT true;

-- Habilita RLS na tabela de lentes
ALTER TABLE public.lenses ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Lentes são visíveis publicamente" ON public.lenses;
CREATE POLICY "Lentes são visíveis publicamente"
  ON public.lenses
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Apenas admins podem gerenciar lentes" ON public.lenses;
CREATE POLICY "Apenas admins podem gerenciar lentes"
  ON public.lenses
  FOR ALL
  USING (
    auth.role() = 'service_role' OR 
    (SELECT public.is_admin())
  )
  WITH CHECK (
    auth.role() = 'service_role' OR 
    (SELECT public.is_admin())
  );

-- Comentários informativos
COMMENT ON COLUMN public.products.original_price IS 'Preço original/antigo em reais (ex: 249.90) para exibição de promoção com valor riscado';
COMMENT ON COLUMN public.lenses.original_price IS 'Preço original/antigo da lente em reais (ex: 249.90) para exibição riscada quando maior que o atual';
COMMENT ON COLUMN public.lenses.show_discount_badge IS 'Determina se o selo com porcentagem de desconto calculada automaticamente deve ser exibido';
