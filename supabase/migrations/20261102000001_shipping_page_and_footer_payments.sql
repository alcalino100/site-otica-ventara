-- ============================================================================
-- MIGRATION: 20261102000001_shipping_page_and_footer_payments.sql
-- PROJETO: Ótica Ventara — Página de Entregas e Formas de Pagamento no Rodapé
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA: shipping_page_settings (Configurações Gerais da Página de Entregas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  slug TEXT NOT NULL DEFAULT 'entregas',
  hero_title TEXT NOT NULL DEFAULT 'Rede de Entregas Ventara',
  hero_subtitle TEXT NOT NULL DEFAULT 'Da nossa ótica em Araçatuba para todo o Brasil',
  hero_cta_text TEXT NOT NULL DEFAULT 'Rastrear seu pedido',
  hero_cta_url TEXT NOT NULL DEFAULT '/rastreio',
  local_title TEXT NOT NULL DEFAULT 'Entrega Expressa em Araçatuba e Região',
  local_description TEXT NOT NULL DEFAULT 'Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.',
  local_cities TEXT NOT NULL DEFAULT 'Araçatuba, Birigui, Bilac, Gabriel Monteiro, Coroados e Guararapes',
  local_timeframe TEXT NOT NULL DEFAULT 'Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)',
  local_conditions TEXT NOT NULL DEFAULT 'Opção de retirada gratuita no balcão da loja física ou entrega direta',
  local_image_url TEXT NOT NULL DEFAULT '/images/shipping/van-ventara-aracatuba.jpg',
  national_title TEXT NOT NULL DEFAULT 'Envio Seguro para Todo o Brasil',
  national_description TEXT NOT NULL DEFAULT 'Para cidades distantes e outros estados, seus óculos são despachados pelas principais transportadoras e Correios com seguro de transporte integral e código de rastreamento ponto a ponto.',
  national_timeframe TEXT NOT NULL DEFAULT 'Prazo calculado automaticamente conforme o seu CEP',
  national_conditions TEXT NOT NULL DEFAULT 'Embalagem rígida reforçada contra impactos em todos os pedidos',
  national_image_url TEXT NOT NULL DEFAULT '/images/shipping/envio-brasil-azul-cargo.png',
  carriers_section_title TEXT NOT NULL DEFAULT 'Transportadoras que utilizamos',
  carriers_section_subtitle TEXT NOT NULL DEFAULT 'Enviamos com os maiores operadores logísticos do país para garantir agilidade e pontualidade',
  timeline_section_title TEXT NOT NULL DEFAULT 'Como funciona nosso fluxo de entrega',
  timeline_section_subtitle TEXT NOT NULL DEFAULT 'Do pedido confirmado no laboratório próprio até a chegada às suas mãos',
  faq_section_title TEXT NOT NULL DEFAULT 'Perguntas Frequentes sobre Entregas',
  faq_section_subtitle TEXT NOT NULL DEFAULT 'Tire suas dúvidas sobre prazos, embalagens especiais, rastreio e políticas de devolução',
  whatsapp_cta_title TEXT NOT NULL DEFAULT 'Ficou com alguma dúvida sobre a entrega?',
  whatsapp_cta_subtitle TEXT NOT NULL DEFAULT 'Nossa equipe de consultoria e suporte em Araçatuba está à disposição no WhatsApp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. TABELA: shipping_carriers (Transportadoras Utilizadas - Cards Dinâmicos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_carriers_sort ON public.shipping_carriers(sort_order);
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_active ON public.shipping_carriers(is_active);

-- ----------------------------------------------------------------------------
-- 3. TABELA: shipping_faqs (Perguntas Frequentes de Entregas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_faqs_sort ON public.shipping_faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_shipping_faqs_active ON public.shipping_faqs(is_active);

-- ----------------------------------------------------------------------------
-- 4. RLS & POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.shipping_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_faqs ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_page_settings_public_read" ON public.shipping_page_settings;
  CREATE POLICY "shipping_page_settings_public_read" ON public.shipping_page_settings FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_carriers_public_read" ON public.shipping_carriers;
  CREATE POLICY "shipping_carriers_public_read" ON public.shipping_carriers FOR SELECT USING (is_active = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_faqs_public_read" ON public.shipping_faqs;
  CREATE POLICY "shipping_faqs_public_read" ON public.shipping_faqs FOR SELECT USING (is_active = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Acesso administrativo total
DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_page_settings_admin_all" ON public.shipping_page_settings;
  CREATE POLICY "shipping_page_settings_admin_all" ON public.shipping_page_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_carriers_admin_all" ON public.shipping_carriers;
  CREATE POLICY "shipping_carriers_admin_all" ON public.shipping_carriers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "shipping_faqs_admin_all" ON public.shipping_faqs;
  CREATE POLICY "shipping_faqs_admin_all" ON public.shipping_faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 5. SEED INICIAL DE DADOS
-- ----------------------------------------------------------------------------
INSERT INTO public.shipping_page_settings (
  is_enabled, slug, hero_title, hero_subtitle
) VALUES (
  true, 'entregas', 'Rede de Entregas Ventara', 'Da nossa ótica em Araçatuba para todo o Brasil'
) ON CONFLICT DO NOTHING;

INSERT INTO public.shipping_carriers (name, slug, description, delivery_time, logo_url, is_active, sort_order)
VALUES
  ('Entrega Própria Ventara', 'entrega-propria-ventara', 'Frota local dedicada para entregas rápidas e personalizadas em Araçatuba e região.', 'Até 24h a 48h úteis após montagem no laboratório', '/images/shipping/van-ventara-aracatuba.jpg', true, 1),
  ('Azul Cargo Express', 'azul-cargo', 'Logística aérea e rodoviária expressa com alta frequência de voos entre as principais cidades.', 'Em média 2 a 5 dias úteis (conforme destino)', '/images/shipping/envio-brasil-azul-cargo.png', true, 2),
  ('Gollog', 'gollog', 'Transporte aéreo ágil conectando aeroportos nacionais com monitoramento contínuo.', 'Em média 2 a 6 dias úteis', '/images/shipping/transportadora-gollog.jpg', true, 3),
  ('Sedex e PAC (Correios)', 'correios-sedex', 'Alcance completo em 100% dos municípios do Brasil com código de rastreamento oficial.', 'Sedex de 1 a 4 dias úteis · PAC de 5 a 12 dias úteis', '/images/shipping/transportadora-sedex.png', true, 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.shipping_faqs (question, answer, category, is_active, sort_order)
VALUES
  ('Como acompanho o rastreamento do meu pedido?', 'Assim que seu pedido é despachado, enviamos o código de rastreamento por WhatsApp e e-mail. Você também pode consultar o status em tempo real a qualquer momento em nossa página de rastreio digitando seu código ou CPF.', 'rastreio', true, 1),
  ('Qual é o prazo médio de entrega para minha cidade?', 'O prazo exato é calculado automaticamente no checkout ao informar o seu CEP. Para Araçatuba e cidades vizinhas atendidas pela nossa van, a entrega costuma ocorrer em até 24h a 48h úteis após a montagem. Para outras cidades do Brasil, os prazos variam entre 2 e 8 dias úteis conforme a modalidade escolhida.', 'prazos', true, 2),
  ('Os óculos viajam protegidos contra quebra e impacto?', 'Sim! Todos os óculos são protegidos em estojo rígido de alta durabilidade, envolvidos em camadas de amortecimento e lacrados em caixas protetoras reforçadas. Além disso, todos os despachos contam com seguro total de transporte.', 'embalagem', true, 3),
  ('O que acontece se o endereço informado estiver incorreto?', 'Caso perceba qualquer inconsistência no endereço cadastrado, entre em contato imediatamente com nosso WhatsApp de atendimento. Enquanto o pedido estiver no laboratório ou em triagem, realizamos a alteração antes do despacho.', 'endereco', true, 4),
  ('Como funciona a garantia e a política de trocas?', 'Respeitamos integralmente o Código de Defesa do Consumidor. Caso seus óculos apresentem qualquer inconformidade ou você deseje trocar a armação, você tem até 7 (sete) dias corridos após o recebimento para acionar nossa central de suporte.', 'trocas', true, 5)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ATUALIZAÇÃO DE SITE_SETTINGS PARA FORMAS DE PAGAMENTO NO RODAPÉ
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (key, description, value)
VALUES (
  'payment_methods',
  'Configurações das formas de pagamento e selos exibidos no rodapé',
  '{
    "show_footer_block": true,
    "show_secure_badge": true,
    "secure_badge_text": "Pagamento seguro com Mercado Pago",
    "block_title": "Formas de Pagamento",
    "methods": [
      {"id": "visa", "name": "Visa", "icon_path": "/logos/payments/visa.svg", "is_active": true, "sort_order": 1, "alt_text": "Cartão de Crédito Visa"},
      {"id": "mastercard", "name": "Mastercard", "icon_path": "/logos/payments/mastercard.svg", "is_active": true, "sort_order": 2, "alt_text": "Cartão de Crédito Mastercard"},
      {"id": "elo", "name": "Elo", "icon_path": "/logos/payments/elo.svg", "is_active": true, "sort_order": 3, "alt_text": "Cartão Elo"},
      {"id": "amex", "name": "American Express", "icon_path": "/logos/payments/amex.svg", "is_active": true, "sort_order": 4, "alt_text": "Cartão American Express"},
      {"id": "hipercard", "name": "Hipercard", "icon_path": "/logos/payments/hipercard.svg", "is_active": true, "sort_order": 5, "alt_text": "Cartão Hipercard"},
      {"id": "pix", "name": "Pix", "icon_path": "/logos/payments/pix.svg", "is_active": true, "sort_order": 6, "alt_text": "Pagamento instantâneo via Pix"}
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
