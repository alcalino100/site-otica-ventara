-- E-mail "pedido recebido, aguardando pagamento" ao cliente (desligado por padrão).
ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS customer_pending boolean NOT NULL DEFAULT false;

DROP INDEX IF EXISTS public.email_log_customer_once_idx;
CREATE UNIQUE INDEX IF NOT EXISTS email_log_customer_once_idx ON public.email_log (kind, ref, to_email)
  WHERE status = 'sent' AND kind IN ('customer_pending', 'customer_paid', 'customer_unpaid', 'customer_shipped');
