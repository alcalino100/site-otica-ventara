-- Endurece a roleta: a migration original liberava leitura/escrita de leads (telefones) e cupons para
-- QUALQUER usuário autenticado. O app usa a service role (ignora RLS), então essas políticas não são necessárias.
DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins have full access to campaigns" ON public.campaigns;
  END IF;
  IF to_regclass('public.campaign_revisions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins have full access to revisions" ON public.campaign_revisions;
  END IF;
  IF to_regclass('public.promotion_leads') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins have access to leads" ON public.promotion_leads;
  END IF;
  IF to_regclass('public.promotion_coupons') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins have full access to coupons" ON public.promotion_coupons;
  END IF;
  IF to_regclass('public.promotion_participations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins have full access to participations" ON public.promotion_participations;
  END IF;
END $$;
