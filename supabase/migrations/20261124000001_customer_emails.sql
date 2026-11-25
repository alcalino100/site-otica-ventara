-- E-mails transacionais ao cliente (compra confirmada, pedido sem pagamento, pedido pronto/enviado).
-- Tudo DESLIGADO por padrão: nada é enviado ao cliente até o admin ligar em Recuperação & Avisos.
ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS customer_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_unpaid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_shipped boolean NOT NULL DEFAULT false;

-- Nunca envia o mesmo e-mail duas vezes ao mesmo cliente para o mesmo pedido
CREATE UNIQUE INDEX IF NOT EXISTS email_log_customer_once_idx ON public.email_log (kind, ref, to_email)
  WHERE status = 'sent' AND kind IN ('customer_paid', 'customer_unpaid', 'customer_shipped');
