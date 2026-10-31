-- ============================================================================
-- MIGRATION: 20261031000001_hero_slides_and_settings.sql
-- PROJETO: Ótica Ventara — Hero Full-Bleed & Carrossel de Banners Gerenciável
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA: hero_slides (Slides de Fundo Full-Bleed do Hero da Home)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url_desktop TEXT NOT NULL,
  image_url_mobile TEXT,
  alt_text TEXT NOT NULL DEFAULT 'Ótica Ventara — Mais que óculos, é sobre você.',
  focal_point_desktop TEXT NOT NULL DEFAULT 'center',
  custom_position_x INTEGER NOT NULL DEFAULT 50,
  custom_position_y INTEGER NOT NULL DEFAULT 50,
  focal_point_mobile TEXT NOT NULL DEFAULT 'center',
  fit_mode TEXT NOT NULL DEFAULT 'cover',
  overlay_intensity INTEGER NOT NULL DEFAULT 75,
  overlay_color TEXT NOT NULL DEFAULT '#02070D',
  click_url TEXT,
  
  -- Visibilidade e Conteúdo dos Badges e Textos
  show_only_photo BOOLEAN NOT NULL DEFAULT false,
  show_badge_quality BOOLEAN NOT NULL DEFAULT true,
  badge_quality_text TEXT NOT NULL DEFAULT 'QUALIDADE QUE VOCÊ VÊ',
  show_badge_style BOOLEAN NOT NULL DEFAULT true,
  badge_style_text TEXT NOT NULL DEFAULT 'ARMAÇÕES DE QUALIDADE E ESTILO',
  show_badge_stock BOOLEAN NOT NULL DEFAULT true,
  badge_stock_text TEXT NOT NULL DEFAULT 'Em Estoque · Envio Imediato',
  show_badge_curation BOOLEAN NOT NULL DEFAULT true,
  badge_curation_text TEXT NOT NULL DEFAULT 'Curadoria Autoral Ventara · Acetato Premium',
  badge_curation_url TEXT NOT NULL DEFAULT '/catalogo',
  show_title BOOLEAN NOT NULL DEFAULT true,
  title_text TEXT,
  show_description BOOLEAN NOT NULL DEFAULT true,
  description_text TEXT,
  show_buttons BOOLEAN NOT NULL DEFAULT true,
  primary_button_text TEXT NOT NULL DEFAULT 'Catálogo de Lentes',
  primary_button_url TEXT NOT NULL DEFAULT '/lentes',
  secondary_button_text TEXT NOT NULL DEFAULT 'Ver armações',
  secondary_button_url TEXT NOT NULL DEFAULT '#armacoes',
  show_trust_markers BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON public.hero_slides(sort_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON public.hero_slides(is_active);

DO $$ BEGIN
  CREATE TRIGGER set_hero_slides_updated_at
    BEFORE UPDATE ON public.hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Leitura pública de slides ativos
DO $$ BEGIN
  DROP POLICY IF EXISTS "hero_slides_public_read" ON public.hero_slides;
  CREATE POLICY "hero_slides_public_read"
    ON public.hero_slides
    FOR SELECT
    USING (is_active = true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Acesso total para administradores autenticados
DO $$ BEGIN
  DROP POLICY IF EXISTS "hero_slides_admin_all" ON public.hero_slides;
  CREATE POLICY "hero_slides_admin_all"
    ON public.hero_slides
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2. TABELA: hero_settings (Configurações Gerais do Carrossel do Hero)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autoplay BOOLEAN NOT NULL DEFAULT true,
  interval_ms INTEGER NOT NULL DEFAULT 5000,
  transition_type TEXT NOT NULL DEFAULT 'fade',
  show_arrows BOOLEAN NOT NULL DEFAULT true,
  show_indicators BOOLEAN NOT NULL DEFAULT true,
  pause_on_hover BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TRIGGER set_hero_settings_updated_at
    BEFORE UPDATE ON public.hero_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública de configurações
DO $$ BEGIN
  DROP POLICY IF EXISTS "hero_settings_public_read" ON public.hero_settings;
  CREATE POLICY "hero_settings_public_read"
    ON public.hero_settings
    FOR SELECT
    USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Apenas admins autenticados alteram configurações
DO $$ BEGIN
  DROP POLICY IF EXISTS "hero_settings_admin_all" ON public.hero_settings;
  CREATE POLICY "hero_settings_admin_all"
    ON public.hero_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 3. STORAGE BUCKET: hero-images (Fotos Full-Bleed do Hero)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('hero-images', 'hero-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Imagens do Hero são publicamente visíveis' 
      AND tablename = 'objects' 
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Imagens do Hero são publicamente visíveis" 
      ON storage.objects FOR SELECT 
      USING (bucket_id = 'hero-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins podem fazer upload de imagens do Hero' 
      AND tablename = 'objects' 
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Admins podem fazer upload de imagens do Hero" 
      ON storage.objects FOR INSERT 
      TO authenticated
      WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins podem atualizar imagens do Hero' 
      AND tablename = 'objects' 
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Admins podem atualizar imagens do Hero" 
      ON storage.objects FOR UPDATE 
      TO authenticated
      USING (bucket_id = 'hero-images' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins podem deletar imagens do Hero' 
      AND tablename = 'objects' 
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Admins podem deletar imagens do Hero" 
      ON storage.objects FOR DELETE 
      TO authenticated
      USING (bucket_id = 'hero-images' AND public.is_admin());
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 4. SEED INICIAL: Slide e Configuração Padrão
-- ----------------------------------------------------------------------------
INSERT INTO public.hero_settings (autoplay, interval_ms, transition_type, show_arrows, show_indicators, pause_on_hover)
SELECT true, 5000, 'fade', true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_settings LIMIT 1);

INSERT INTO public.hero_slides (
  sort_order,
  is_active,
  image_url_desktop,
  image_url_mobile,
  alt_text,
  focal_point_desktop,
  fit_mode,
  overlay_intensity,
  overlay_color,
  show_only_photo,
  show_badge_quality,
  badge_quality_text,
  show_badge_style,
  badge_style_text,
  show_badge_stock,
  badge_stock_text,
  show_badge_curation,
  badge_curation_text,
  badge_curation_url
)
SELECT
  0,
  true,
  'https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792716830393-u708m6.jpg',
  NULL,
  'Ótica Ventara — Armações Nobres e Lentes de Alta Precisão',
  'center',
  'cover',
  75,
  '#02070D',
  false,
  true,
  'QUALIDADE QUE VOCÊ VÊ',
  true,
  'ARMAÇÕES DE QUALIDADE E ESTILO',
  true,
  'Em Estoque · Envio Imediato',
  true,
  'Curadoria Autoral Ventara · Acetato Premium',
  '/catalogo'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides LIMIT 1);
