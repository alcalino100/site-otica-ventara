-- Roleta: controle de contato para recuperar leads (quem girou a roleta e não comprou).
ALTER TABLE public.promotion_leads ADD COLUMN IF NOT EXISTS contacted_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_leads_contacted ON public.promotion_leads (contacted_at);
