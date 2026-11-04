-- ============================================================================
-- Ótica Ventara - Migration: Auditoria Completa de Transações de Pagamento
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  reference_code TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_document TEXT,
  customer_phone TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  amount_in_cents INTEGER NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'sandbox')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected', 'failed', 'cancelled')),
  status_detail TEXT,
  gateway TEXT NOT NULL DEFAULT 'mercadopago',
  gateway_payment_id TEXT,
  error_code TEXT,
  error_message TEXT,
  friendly_explanation TEXT,
  request_payload JSONB,
  response_payload JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices estratégicos para performance nas buscas do painel admin
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ref ON public.payment_transactions(reference_code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON public.payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON public.payment_transactions(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_email ON public.payment_transactions(customer_email);

-- Comentários descritivos
COMMENT ON TABLE public.payment_transactions IS 'Registro de auditoria e telemetria de todas as tentativas de pagamento (Pix, Cartão de Crédito) do e-commerce e diagnósticos de teste.';

-- RLS (Row Level Security)
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Service Role possui permissão total
CREATE POLICY "Service Role pode gerenciar todas as transações"
  ON public.payment_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Administradores autenticados podem consultar transações
CREATE POLICY "Admins podem visualizar auditoria de transações"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );
