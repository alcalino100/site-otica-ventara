-- ============================================================================
-- MIGRATION: 20261031000004_hero_secure_payment_badge.sql
-- PROJETO: Ótica Ventara — Campos do Selo de Pagamento Seguro Mercado Pago
-- ============================================================================

-- 1. Adiciona campos de selo de segurança na tabela de configurações globais do hero
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hero_settings') THEN
    ALTER TABLE public.hero_settings 
      ADD COLUMN IF NOT EXISTS show_secure_badge BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS secure_badge_text TEXT NOT NULL DEFAULT 'Compra segura com Mercado Pago';
  END IF;
END $$;

-- 2. Adiciona campos também na tabela hero_slides caso o lojista deseje customização por slide
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hero_slides') THEN
    ALTER TABLE public.hero_slides 
      ADD COLUMN IF NOT EXISTS show_secure_badge BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS secure_badge_text TEXT NOT NULL DEFAULT 'Compra segura com Mercado Pago';
  END IF;
END $$;

-- 3. Atualiza os registros existentes em site_settings caso use a tabela de fallback
UPDATE public.site_settings
SET value = jsonb_set(
  jsonb_set(value, '{show_secure_badge}', 'true'::jsonb, true),
  '{secure_badge_text}', '"Compra segura com Mercado Pago"'::jsonb, true
)
WHERE key = 'hero_carousel_settings';
