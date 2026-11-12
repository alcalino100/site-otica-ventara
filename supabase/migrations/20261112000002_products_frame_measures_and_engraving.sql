-- ============================================================================
-- MIGRATION: 20261112000002_products_frame_measures_and_engraving.sql
-- PROJETO: Ótica Ventara — Cadastro de produtos
-- OBJETIVO: Criar as colunas que o cadastro/edição de produto já grava e a ficha
--           técnica (PDP) já lê, mas que nunca tiveram migration:
--             - dimensions_frame_width_mm  (largura total da armação)
--             - dimensions_lens_height_mm  (altura da lente)
--             - has_temple_engraving       (gravação na haste)
--             - material_origin            (origem/detalhe do material)
--           Sem elas o cadastro falha com:
--           "Could not find the 'dimensions_frame_width_mm' column of 'products' in the schema cache".
-- Idempotente: pode ser executada mais de uma vez com segurança.
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS dimensions_frame_width_mm INTEGER
    CHECK (dimensions_frame_width_mm IS NULL OR dimensions_frame_width_mm > 0),
  ADD COLUMN IF NOT EXISTS dimensions_lens_height_mm INTEGER
    CHECK (dimensions_lens_height_mm IS NULL OR dimensions_lens_height_mm > 0),
  ADD COLUMN IF NOT EXISTS has_temple_engraving BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS material_origin TEXT;

COMMENT ON COLUMN public.products.dimensions_frame_width_mm IS 'Largura total da armação em mm (ficha técnica)';
COMMENT ON COLUMN public.products.dimensions_lens_height_mm IS 'Altura da lente em mm (ficha técnica)';
COMMENT ON COLUMN public.products.has_temple_engraving IS 'Indica se a haste possui gravação';
COMMENT ON COLUMN public.products.material_origin IS 'Origem ou detalhe do material da armação';

-- Faz o PostgREST (Supabase API) enxergar as novas colunas imediatamente
NOTIFY pgrst, 'reload schema';
