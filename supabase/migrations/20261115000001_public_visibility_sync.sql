-- Visibilidade pública: o que o admin salva precisa aparecer no site.
-- O admin grava `is_published`; as regras de acesso (RLS) do visitante usam `status` + `availability`.
-- Se os dois divergirem, o banco esconde cores (product_variants) e fotos (product_images) do visitante.
-- Idempotente: pode ser executado mais de uma vez.

-- 1) Trigger: is_published (admin) passa a refletir em status, e status/availability continuam derivando a flag.
CREATE OR REPLACE FUNCTION public.sync_product_published_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Produto criado pelo admin com is_published = true (status ficou no padrão 'rascunho')
    IF NEW.is_published = true AND NEW.status = 'rascunho' THEN
      NEW.status := 'publicado';
    END IF;
  ELSIF NEW.is_published IS DISTINCT FROM OLD.is_published AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    -- Admin mudou só is_published: status acompanha
    NEW.status := CASE WHEN NEW.is_published THEN 'publicado' ELSE 'rascunho' END;
  END IF;

  NEW.is_published := (NEW.status = 'publicado' AND NEW.availability IN ('disponivel', 'sob_consulta'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_product_published_flag ON public.products;
CREATE TRIGGER trigger_sync_product_published_flag
  BEFORE INSERT OR UPDATE OF status, availability, is_published ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_published_flag();

-- 2) Corrige produtos já existentes: publicados no admin (is_published) mas com status 'rascunho'
UPDATE public.products
SET status = 'publicado'
WHERE is_published = true AND status = 'rascunho' AND availability <> 'fora_do_site';

-- 3) Cores e fotos visíveis para o visitante quando o produto está publicado (por qualquer um dos dois campos)
DROP POLICY IF EXISTS "Público pode visualizar variantes de produtos publicados" ON public.product_variants;
CREATE POLICY "Público pode visualizar variantes de produtos publicados"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND (p.is_published = true OR (p.status = 'publicado' AND p.availability IN ('disponivel', 'sob_consulta')) OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Público pode visualizar imagens de produtos publicados" ON public.product_images;
CREATE POLICY "Público pode visualizar imagens de produtos publicados"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.is_published = true OR (p.status = 'publicado' AND p.availability IN ('disponivel', 'sob_consulta')) OR public.is_admin())
    )
  );

NOTIFY pgrst, 'reload schema';

-- Rollback: reaplicar as políticas e a função de 20261109000001_unified_products_schema_and_scale.sql
