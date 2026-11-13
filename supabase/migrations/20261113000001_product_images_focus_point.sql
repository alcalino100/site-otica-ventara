-- =============================================================================
-- Posição da foto nos cards (ajustada no admin arrastando a foto)
-- focus_x / focus_y = % do object-position (0 = esquerda/topo, 100 = direita/base).
-- NULL nos dois = enquadramento automático do site (comportamento atual).
-- Seguro para rodar mais de uma vez.
-- =============================================================================

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS focus_x NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS focus_y NUMERIC(5,2);

ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_focus_range;
ALTER TABLE public.product_images
  ADD CONSTRAINT product_images_focus_range
  CHECK (
    (focus_x IS NULL OR (focus_x >= 0 AND focus_x <= 100))
    AND (focus_y IS NULL OR (focus_y >= 0 AND focus_y <= 100))
  );

COMMENT ON COLUMN public.product_images.focus_x IS 'Posição horizontal da foto nos cards (% do object-position). NULL = automático.';
COMMENT ON COLUMN public.product_images.focus_y IS 'Posição vertical da foto nos cards (% do object-position). NULL = automático.';

-- Faz a API do Supabase enxergar as colunas novas imediatamente
NOTIFY pgrst, 'reload schema';
