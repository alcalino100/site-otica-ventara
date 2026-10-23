-- =========================================================================
-- MIGRATION: Roleta Promocional, Captura de Leads e Emissão de Cupons
-- Projeto: Óticas Ventara Eyewear
-- =========================================================================

-- 1. Tabela de Campanhas Promocionais
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'ended', 'disabled')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  distribution_mode TEXT NOT NULL DEFAULT 'FIXED' CHECK (distribution_mode IN ('FIXED', 'WEIGHTED')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Histórico de Versões e Auditoria de Publicação
CREATE TABLE IF NOT EXISTS public.campaign_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  version INT NOT NULL,
  config_snapshot JSONB NOT NULL,
  author TEXT NOT NULL DEFAULT 'Administrador',
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Leads Capturados
CREATE TABLE IF NOT EXISTS public.promotion_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  phone_masked TEXT NOT NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índice único para busca rápida por telefone normalizado
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.promotion_leads (phone_normalized);

-- 4. Tabela de Cupons Emitidos
CREATE TABLE IF NOT EXISTS public.promotion_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  campaign_id TEXT NOT NULL,
  lead_id UUID REFERENCES public.promotion_leads(id) ON DELETE SET NULL,
  benefit_type TEXT NOT NULL DEFAULT 'percentage',
  benefit_value NUMERIC(10, 2) NOT NULL DEFAULT 10,
  rules_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_operator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.promotion_coupons (code);

-- 5. Tabela de Participações Confirmadas
CREATE TABLE IF NOT EXISTS public.promotion_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  campaign_version INT NOT NULL DEFAULT 1,
  lead_id UUID NOT NULL REFERENCES public.promotion_leads(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  winning_segment_id TEXT NOT NULL,
  benefit_label TEXT NOT NULL,
  coupon_id UUID REFERENCES public.promotion_coupons(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_participations_campaign_lead ON public.promotion_participations (campaign_id, lead_id);

-- 6. Registro de Consentimento LGPD
CREATE TABLE IF NOT EXISTS public.promotion_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.promotion_leads(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('granted', 'declined')),
  text_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Registro de Auditoria Administrativa
CREATE TABLE IF NOT EXISTS public.promotion_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_audit_logs ENABLE ROW LEVEL SECURITY;

-- Público pode ler apenas configuração publicada de campanha ativa
DROP POLICY IF EXISTS "Public can view active published campaign" ON public.campaigns;
CREATE POLICY "Public can view active published campaign"
  ON public.campaigns FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Administradores autenticados têm controle total
DROP POLICY IF EXISTS "Admins have full access to campaigns" ON public.campaigns;
CREATE POLICY "Admins have full access to campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to revisions" ON public.campaign_revisions;
CREATE POLICY "Admins have full access to revisions"
  ON public.campaign_revisions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have access to leads" ON public.promotion_leads;
CREATE POLICY "Admins have access to leads"
  ON public.promotion_leads FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to coupons" ON public.promotion_coupons;
CREATE POLICY "Admins have full access to coupons"
  ON public.promotion_coupons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to participations" ON public.promotion_participations;
CREATE POLICY "Admins have full access to participations"
  ON public.promotion_participations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
