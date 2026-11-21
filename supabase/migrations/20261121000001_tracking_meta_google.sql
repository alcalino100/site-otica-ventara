-- Rastreamento (Meta Pixel + API de Conversões + Google Ads) — configuração, auditoria e contexto de pedidos.
-- Tabelas SEM política pública: só o servidor (service_role) lê/grava. O token da API fica aqui, nunca em site_settings.

CREATE TABLE IF NOT EXISTS public.tracking_config (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  meta_pixel_id text,
  meta_capi_token text,
  meta_test_event_code text,
  google_ads_id text,        -- AW-XXXXXXXXXX
  google_ga4_id text,        -- G-XXXXXXXXXX (opcional)
  meta_enabled boolean NOT NULL DEFAULT false,
  google_enabled boolean NOT NULL DEFAULT false,
  -- { "purchase": { "meta": true, "google": true, "google_label": "AbC-dEfG" }, ... }
  events jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tracking_config (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_key text NOT NULL,
  destination text NOT NULL CHECK (destination IN ('meta', 'google')),
  source text NOT NULL CHECK (source IN ('browser', 'server')),
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  event_id text,
  order_id uuid,
  value_in_cents integer,
  currency text,
  path text,
  http_status integer,
  error text
);

CREATE INDEX IF NOT EXISTS tracking_events_created_idx ON public.tracking_events (created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_events_event_idx ON public.tracking_events (event_key, destination, created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_events_event_id_idx ON public.tracking_events (event_id);

CREATE TABLE IF NOT EXISTS public.tracking_order_context (
  order_id uuid PRIMARY KEY,
  fbp text,
  fbc text,
  client_ip text,
  user_agent text,
  event_source_url text,
  marketing_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_order_context ENABLE ROW LEVEL SECURITY;
-- Sem policies: anon/authenticated não acessam. service_role ignora RLS.
REVOKE ALL ON public.tracking_config, public.tracking_events, public.tracking_order_context FROM anon, authenticated;
