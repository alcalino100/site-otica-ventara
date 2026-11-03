-- ============================================================================
-- MIGRATION: 20261103000003_shipping_cms_and_versioning.sql
-- PROJETO: Ótica Ventara — CMS Completo da Página /entregas, Rascunho/Publicação e Histórico
-- ============================================================================

-- 1. TABELA: shipping_cms_settings (Configuração Rascunho e Publicado)
CREATE TABLE IF NOT EXISTS public.shipping_cms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL UNIQUE CHECK (status IN ('draft', 'published')),
  schema_version INTEGER NOT NULL DEFAULT 1,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS set_shipping_cms_settings_updated_at ON public.shipping_cms_settings;
CREATE TRIGGER set_shipping_cms_settings_updated_at
  BEFORE UPDATE ON public.shipping_cms_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. TABELA: shipping_cms_history (Snapshots de Versões Publicadas)
CREATE TABLE IF NOT EXISTS public.shipping_cms_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by TEXT,
  version_label TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1,
  sections JSONB NOT NULL,
  theme JSONB NOT NULL,
  seo JSONB NOT NULL,
  change_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_shipping_cms_history_published_at
  ON public.shipping_cms_history (published_at DESC);

-- 3. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.shipping_cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_cms_history ENABLE ROW LEVEL SECURITY;

-- Políticas para shipping_cms_settings
DROP POLICY IF EXISTS "shipping_cms_settings_public_read_published" ON public.shipping_cms_settings;
CREATE POLICY "shipping_cms_settings_public_read_published"
  ON public.shipping_cms_settings
  FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "shipping_cms_settings_admin_write" ON public.shipping_cms_settings;
CREATE POLICY "shipping_cms_settings_admin_write"
  ON public.shipping_cms_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para shipping_cms_history
DROP POLICY IF EXISTS "shipping_cms_history_admin_all" ON public.shipping_cms_history;
CREATE POLICY "shipping_cms_history_admin_all"
  ON public.shipping_cms_history
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
