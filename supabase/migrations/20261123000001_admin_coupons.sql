-- Cupons criados no admin (campanhas), com limites de uso e controle por cliente.
-- Os cupons únicos da roleta continuam em promotion_coupons.

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code = upper(code) AND code ~ '^[A-Z0-9-]{4,24}$'),
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10, 2) NOT NULL CHECK (discount_value > 0),
  max_discount_cents integer CHECK (max_discount_cents IS NULL OR max_discount_cents > 0),
  min_order_cents integer NOT NULL DEFAULT 0 CHECK (min_order_cents >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses_total integer CHECK (max_uses_total IS NULL OR max_uses_total > 0),
  max_uses_per_customer integer NOT NULL DEFAULT 1 CHECK (max_uses_per_customer > 0),
  active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (discount_type <> 'percentage' OR discount_value <= 100)
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  order_id uuid,
  reference_code text,
  customer_email text,
  customer_phone text,
  customer_document text,
  discount_in_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_idx ON public.coupon_redemptions (coupon_id, status);
CREATE INDEX IF NOT EXISTS coupon_redemptions_order_idx ON public.coupon_redemptions (order_id);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
-- Sem policies: só o servidor (service_role) acessa. Nada de leitura pública dos códigos.
REVOKE ALL ON public.coupons, public.coupon_redemptions FROM anon, authenticated;

-- Aplica (ou apenas simula) um cupom de forma ATÔMICA: trava a linha do cupom para que dois
-- pedidos simultâneos não estourem o limite de usos.
CREATE OR REPLACE FUNCTION public.coupon_apply(
  p_code text,
  p_subtotal_cents integer,
  p_email text,
  p_phone text,
  p_document text,
  p_order_id uuid DEFAULT NULL,
  p_reference text DEFAULT NULL,
  p_dry_run boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  v_code text := upper(trim(coalesce(p_code, '')));
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone text := nullif(coalesce(p_phone, ''), '');
  v_doc text := nullif(coalesce(p_document, ''), '');
  v_used_total integer;
  v_used_customer integer;
  v_disc integer;
BEGIN
  IF p_dry_run THEN
    SELECT * INTO c FROM public.coupons WHERE code = v_code;
  ELSE
    SELECT * INTO c FROM public.coupons WHERE code = v_code FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  IF NOT c.active THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'inactive', 'message', 'Este cupom não está ativo.');
  END IF;
  IF c.starts_at IS NOT NULL AND c.starts_at > now() THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'not_started', 'message', 'Este cupom ainda não começou.');
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'expired', 'message', 'Este cupom já expirou.');
  END IF;
  IF p_subtotal_cents < c.min_order_cents THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'min_order',
      'message', 'Este cupom vale para compras a partir de R$ ' || to_char(c.min_order_cents / 100.0, 'FM999G990D00') || '.');
  END IF;

  SELECT count(*) INTO v_used_total FROM public.coupon_redemptions
   WHERE coupon_id = c.id AND status IN ('reserved', 'confirmed');
  IF c.max_uses_total IS NOT NULL AND v_used_total >= c.max_uses_total THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'exhausted', 'message', 'Este cupom esgotou.');
  END IF;

  -- Limite por cliente: mesmo e-mail, telefone ou CPF contam como a mesma pessoa
  IF v_email IS NOT NULL OR v_phone IS NOT NULL OR v_doc IS NOT NULL THEN
    SELECT count(*) INTO v_used_customer FROM public.coupon_redemptions
     WHERE coupon_id = c.id AND status IN ('reserved', 'confirmed')
       AND ((v_email IS NOT NULL AND customer_email = v_email)
         OR (v_phone IS NOT NULL AND customer_phone = v_phone)
         OR (v_doc IS NOT NULL AND customer_document = v_doc));
    IF v_used_customer >= c.max_uses_per_customer THEN
      RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'customer_limit', 'message', 'Você já usou este cupom.');
    END IF;
  END IF;

  IF c.discount_type = 'percentage' THEN
    v_disc := round(p_subtotal_cents * c.discount_value / 100.0);
    IF c.max_discount_cents IS NOT NULL THEN v_disc := least(v_disc, c.max_discount_cents); END IF;
  ELSE
    v_disc := least(p_subtotal_cents, round(c.discount_value * 100.0)::integer);
  END IF;
  v_disc := greatest(0, least(v_disc, p_subtotal_cents));
  IF v_disc <= 0 THEN
    RETURN jsonb_build_object('found', true, 'ok', false, 'reason', 'no_discount', 'message', 'Este cupom não gera desconto neste carrinho.');
  END IF;

  IF NOT p_dry_run THEN
    INSERT INTO public.coupon_redemptions (coupon_id, order_id, reference_code, customer_email, customer_phone, customer_document, discount_in_cents, status)
    VALUES (c.id, p_order_id, p_reference, v_email, v_phone, v_doc, v_disc, 'reserved');
  END IF;

  RETURN jsonb_build_object('found', true, 'ok', true, 'coupon_id', c.id, 'code', c.code,
    'discount_type', c.discount_type, 'discount_value', c.discount_value, 'discount_in_cents', v_disc,
    'max_discount_cents', c.max_discount_cents, 'min_order_cents', c.min_order_cents);
END;
$$;

REVOKE ALL ON FUNCTION public.coupon_apply(text, integer, text, text, text, uuid, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.coupon_apply(text, integer, text, text, text, uuid, text, boolean) TO service_role;

-- Códigos que já existiam escritos no código do site passam a ser cupons de verdade (1 uso por cliente).
-- Ajuste ou pause depois pela tela /admin/cupons.
INSERT INTO public.coupons (code, description, discount_type, discount_value, max_uses_per_customer, created_by) VALUES
  ('VENTARA10', 'Cupom antigo do site (10%)', 'percentage', 10, 1, 'migração'),
  ('BEMVINDO10', 'Cupom antigo do site (10%)', 'percentage', 10, 1, 'migração'),
  ('VENTARA15', 'Cupom antigo do site (15%)', 'percentage', 15, 1, 'migração'),
  ('BEMVINDO15', 'Cupom antigo do site (15%)', 'percentage', 15, 1, 'migração'),
  ('VENTARA20', 'Cupom antigo do site (20%)', 'percentage', 20, 1, 'migração')
ON CONFLICT (code) DO NOTHING;
