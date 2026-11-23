-- Avisos ao proprietário (e-mail) e recuperação de carrinhos abandonados.
-- Tudo trancado por RLS sem policy: só o servidor (service_role) acessa.

CREATE TABLE IF NOT EXISTS public.notification_settings (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  owner_emails text NOT NULL DEFAULT '',            -- um ou mais e-mails separados por vírgula
  notify_paid boolean NOT NULL DEFAULT true,         -- aviso quando uma venda é paga
  notify_new_order boolean NOT NULL DEFAULT false,   -- aviso quando um pedido é criado (ainda não pago)
  recovery_enabled boolean NOT NULL DEFAULT false,   -- e-mail automático de recuperação
  recovery_delay_hours integer NOT NULL DEFAULT 2 CHECK (recovery_delay_hours BETWEEN 1 AND 72),
  recovery_coupon_code text,                         -- cupom opcional citado no e-mail
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.notification_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,            -- sale_paid | new_order | recovery | test
  ref text,                      -- id do pedido ou do carrinho
  to_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error text
);
-- Nunca envia o mesmo aviso duas vezes para o mesmo destinatário (webhook pode repetir)
CREATE UNIQUE INDEX IF NOT EXISTS email_log_sent_once_idx ON public.email_log (kind, ref, to_email)
  WHERE status = 'sent' AND kind IN ('sale_paid', 'new_order', 'recovery');
CREATE INDEX IF NOT EXISTS email_log_created_idx ON public.email_log (created_at DESC);

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  name text,
  email text,
  phone text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0,
  subtotal_cents integer NOT NULL DEFAULT 0,
  consent_marketing boolean NOT NULL DEFAULT false,
  source_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'contacted', 'unsubscribed')),
  order_id uuid,
  contacted_at timestamptz,
  recovery_email_sent_at timestamptz,
  recovery_email_count integer NOT NULL DEFAULT 0,
  recovered_at timestamptz,
  recovered_value_cents integer,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS abandoned_carts_activity_idx ON public.abandoned_carts (last_activity_at DESC);
CREATE INDEX IF NOT EXISTS abandoned_carts_email_idx ON public.abandoned_carts (lower(email));
CREATE INDEX IF NOT EXISTS abandoned_carts_phone_idx ON public.abandoned_carts (phone);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notification_settings, public.email_log, public.abandoned_carts FROM anon, authenticated;

-- Lista de supressão: quem pediu para não receber lembretes (e-mail/telefone) não volta a ser capturado.
CREATE TABLE IF NOT EXISTS public.cart_suppressions (
  kind text NOT NULL CHECK (kind IN ('email', 'phone')),
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, value)
);
ALTER TABLE public.cart_suppressions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cart_suppressions FROM anon, authenticated;
