-- =============================================================================
-- Zoom da foto (ajustado no admin em "Ajustar posição da foto")
-- focus_zoom = aproximação da foto (1 = sem zoom, até 3). NULL = sem zoom.
-- Seguro para rodar mais de uma vez.
-- =============================================================================

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS focus_zoom NUMERIC(4,2);

ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_focus_zoom_range;
ALTER TABLE public.product_images
  ADD CONSTRAINT product_images_focus_zoom_range
  CHECK (focus_zoom IS NULL OR (focus_zoom >= 1 AND focus_zoom <= 3));

COMMENT ON COLUMN public.product_images.focus_zoom IS 'Zoom da foto nos cards e na página do produto (1 a 3). NULL = sem zoom.';

NOTIFY pgrst, 'reload schema';
