-- ============================================================================
-- MIGRATION: 20261109000002_product_variations_and_reference_showcases.sql
-- PROJETO: Ótica Ventara — Variações de Produto com Preço Próprio e Vitrines por Referência
-- ============================================================================

-- 1. Garantir integridade da tabela products (retrocompatibilidade)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'disponivel' CHECK (availability IN ('disponivel', 'sob_consulta', 'fora_do_site'));

-- 2. Atualizar tabela product_variants com campos de precificação, foto e ordenação
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS price_in_cents INTEGER,
  ADD COLUMN IF NOT EXISTS compare_at_price_in_cents INTEGER,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 3. Sanitização de SKUs existentes em product_variants para garantir unicidade
UPDATE public.product_variants
SET sku = 'VAR-' || UPPER(SUBSTRING(product_id::text, 1, 6)) || '-' || UPPER(SUBSTRING(id::text, 1, 4))
WHERE sku IS NULL OR TRIM(sku) = '';

-- 4. Constraint de unicidade para SKU de variantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_sku_unique'
  ) THEN
    ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_sku_unique UNIQUE (sku);
  END IF;
END $$;

-- 5. Índices de performance para busca rápida e resolução de variações
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_price ON public.product_variants(price_in_cents);

-- 6. Garantir que as políticas RLS permitam leitura pública de variantes ativas
DROP POLICY IF EXISTS "Público pode visualizar variantes de produtos publicados" ON public.product_variants;
CREATE POLICY "Público pode visualizar variantes de produtos publicados"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND ((p.status = 'publicado' AND p.availability IN ('disponivel', 'sob_consulta')) OR public.is_admin())
    )
  );

-- Comentário explicativo de Rollback:
-- Para reverter esta migração:
-- ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_sku_unique;
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS price_in_cents, DROP COLUMN IF EXISTS compare_at_price_in_cents, DROP COLUMN IF EXISTS image_url, DROP COLUMN IF EXISTS is_available, DROP COLUMN IF EXISTS sort_order;
