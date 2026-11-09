-- ============================================================================
-- MIGRATION: 20261109000001_unified_products_schema_and_scale.sql
-- PROJETO: Ótica Ventara — Fonte Única de Produtos, Estabilidade e Escala 1.000+
-- ============================================================================

-- 1. Adicionar colunas de SKU, status de publicação e disponibilidade
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'disponivel' CHECK (availability IN ('disponivel', 'sob_consulta', 'fora_do_site'));

-- 2. Sincronizar status inicial a partir de is_published
UPDATE public.products
SET status = CASE WHEN is_published = true THEN 'publicado' ELSE 'rascunho' END
WHERE status = 'rascunho' AND is_published = true;

-- 3. Garantir SKUs para produtos existentes sem SKU
UPDATE public.products
SET sku = 'VEN-' || UPPER(REPLACE(SUBSTRING(slug FROM 1 FOR 12), '-', '')) || '-' || UPPER(SUBSTRING(id::text, 1, 4))
WHERE sku IS NULL OR TRIM(sku) = '';

-- 4. Constraint de unicidade para SKU do produto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_sku_unique'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
  END IF;
END $$;

-- 5. Trigger para manter sincronizada a flag legada is_published (retrocompatibilidade)
CREATE OR REPLACE FUNCTION public.sync_product_published_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'publicado' AND NEW.availability IN ('disponivel', 'sob_consulta') THEN
    NEW.is_published = true;
  ELSE
    NEW.is_published = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_product_published_flag ON public.products;
CREATE TRIGGER trigger_sync_product_published_flag
  BEFORE INSERT OR UPDATE OF status, availability ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_published_flag();

-- 6. Índices determinísticos de alta performance para escala (1.000+ itens)
CREATE INDEX IF NOT EXISTS idx_products_pagination ON public.products(created_at DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status_availability ON public.products(status, availability);
CREATE INDEX IF NOT EXISTS idx_products_price_in_cents ON public.products(price_in_cents);

-- 7. Atualização das Políticas RLS para respeitar status e disponibilidade
DROP POLICY IF EXISTS "Público pode visualizar produtos publicados" ON public.products;
CREATE POLICY "Público pode visualizar produtos publicados"
  ON public.products FOR SELECT
  USING (
    (status = 'publicado' AND availability IN ('disponivel', 'sob_consulta'))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Público pode visualizar imagens de produtos publicados" ON public.product_images;
CREATE POLICY "Público pode visualizar imagens de produtos publicados"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND ((p.status = 'publicado' AND p.availability IN ('disponivel', 'sob_consulta')) OR public.is_admin())
    )
  );

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
