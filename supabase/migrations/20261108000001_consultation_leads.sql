-- ============================================================================
-- MIGRATION: 20261108000001_consultation_leads.sql
-- PROJETO: Ótica Ventara — Banco de Dados de Leads e Consultoria de Lentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consultation_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT,
  email TEXT,
  social_profile TEXT, -- Perfil Facebook, Instagram ou rede social informada
  product_name TEXT,
  product_slug TEXT,
  lens_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'prescription_received', 'converted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger de updated_at automático
DROP TRIGGER IF EXISTS set_consultation_leads_updated_at ON public.consultation_leads;
CREATE TRIGGER set_consultation_leads_updated_at
  BEFORE UPDATE ON public.consultation_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Índices de busca e filtro
CREATE INDEX IF NOT EXISTS idx_consultation_leads_phone ON public.consultation_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_consultation_leads_created_at ON public.consultation_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_leads_status ON public.consultation_leads(status);

-- RLS (Row Level Security)
ALTER TABLE public.consultation_leads ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer visitante da loja pode registrar uma solicitação de consultoria / orçamento
DROP POLICY IF EXISTS "Permitir inserção pública de leads" ON public.consultation_leads;
CREATE POLICY "Permitir inserção pública de leads"
  ON public.consultation_leads
  FOR INSERT
  WITH CHECK (true);

-- 2. Apenas administradores autenticados podem visualizar e gerenciar os contatos
DROP POLICY IF EXISTS "Permitir leitura apenas por administradores" ON public.consultation_leads;
CREATE POLICY "Permitir leitura apenas por administradores"
  ON public.consultation_leads
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Permitir atualização apenas por administradores" ON public.consultation_leads;
CREATE POLICY "Permitir atualização apenas por administradores"
  ON public.consultation_leads
  FOR UPDATE
  USING (public.is_admin());
