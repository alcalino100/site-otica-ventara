-- ============================================================================
-- MIGRATION: 20261112000001_site_content_engine.sql
-- PROJETO: Ótica Ventara — Motor de Conteúdo Dinâmico do Site (CMS Universal)
-- ============================================================================

-- 1. TABELA: site_content
-- Armazena o estado atual de cada campo/seção por página, diferenciando 'draft' de 'published'.
CREATE TABLE IF NOT EXISTS public.site_content (
  page TEXT NOT NULL,
  key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (page, key, status)
);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS set_site_content_updated_at ON public.site_content;
CREATE TRIGGER set_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Índice para busca rápida de conteúdo por página e status
CREATE INDEX IF NOT EXISTS idx_site_content_page_status
  ON public.site_content (page, status);

-- 2. TABELA: site_content_history
-- Armazena snapshots completos das versões publicadas para auditoria, histórico e reversão.
CREATE TABLE IF NOT EXISTS public.site_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  label TEXT,
  summary TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para ordenação histórica por página e data
CREATE INDEX IF NOT EXISTS idx_site_content_history_page_date
  ON public.site_content_history (page, created_at DESC);

-- 3. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_history ENABLE ROW LEVEL SECURITY;

-- Políticas para site_content:
-- Visitantes públicos têm permissão de leitura EXCLUSIVAMENTE para conteúdo 'published'.
DROP POLICY IF EXISTS "site_content_public_read_published" ON public.site_content;
CREATE POLICY "site_content_public_read_published"
  ON public.site_content
  FOR SELECT
  USING (status = 'published' OR public.is_admin());

-- Administradores autenticados têm controle total de escrita/edição.
DROP POLICY IF EXISTS "site_content_admin_all" ON public.site_content;
CREATE POLICY "site_content_admin_all"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para site_content_history:
-- Histórico acessível exclusivamente por administradores.
DROP POLICY IF EXISTS "site_content_history_admin_all" ON public.site_content_history;
CREATE POLICY "site_content_history_admin_all"
  ON public.site_content_history
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
