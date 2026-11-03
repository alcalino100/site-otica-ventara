-- ============================================================================
-- MIGRATION: 20261103000002_national_cards_images.sql
-- PROJETO: Ótica Ventara — Fotos nos Cartões de Envio Nacional & Ajustes de Transparência
-- ============================================================================

-- 1. Garante que a tabela shipping_page_settings exista
CREATE TABLE IF NOT EXISTS public.shipping_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  slug TEXT NOT NULL DEFAULT 'entregas',
  hero_title TEXT NOT NULL DEFAULT 'Rede de Entregas Ventara',
  hero_subtitle TEXT NOT NULL DEFAULT 'Da nossa ótica em Araçatuba para todo o Brasil',
  hero_cta_text TEXT NOT NULL DEFAULT 'Rastrear seu pedido',
  hero_cta_url TEXT NOT NULL DEFAULT '/rastreio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Garante que TODAS as colunas adicionadas em refatorações existam (idempotente)
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT NOT NULL DEFAULT 'ESTRUTURA LOGÍSTICA & RASTREAMENTO';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_title_line1 TEXT NOT NULL DEFAULT 'Rede de Entregas';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_title_line2 TEXT NOT NULL DEFAULT 'Ventara';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_secondary_cta_text TEXT NOT NULL DEFAULT 'Ver cidades atendidas';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_secondary_cta_url TEXT NOT NULL DEFAULT '#bloco-regional';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT '/images/shipping/hero-glasses-ventara.jpg';

ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS show_highlight_cards BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS show_cargo_insurance BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_1_title TEXT NOT NULL DEFAULT 'Araçatuba e Região';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_1_subtitle TEXT NOT NULL DEFAULT 'Entrega rápida com van própria';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_2_title TEXT NOT NULL DEFAULT 'Envio para todo o Brasil';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_2_subtitle TEXT NOT NULL DEFAULT 'Correios e transporte aéreo';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_insurance_title TEXT NOT NULL DEFAULT 'Seguro de Carga Total';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_insurance_subtitle TEXT NOT NULL DEFAULT 'Proteção garantida em 100% dos envios';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_3_title TEXT NOT NULL DEFAULT 'Rastreio Ponto a Ponto';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS highlight_card_3_subtitle TEXT NOT NULL DEFAULT 'Atualizações em tempo real';

ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_is_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_badge_text TEXT NOT NULL DEFAULT 'LOGÍSTICA PRÓPRIA REGIONAL';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_title_part1 TEXT NOT NULL DEFAULT 'Entrega Expressa em';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_title_part2 TEXT NOT NULL DEFAULT 'Araçatuba e Região';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_description TEXT NOT NULL DEFAULT 'Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_cities_heading TEXT NOT NULL DEFAULT 'CIDADES ATENDIDAS COM ROTA LOCAL';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_cities JSONB NOT NULL DEFAULT '[
  {"id":"city-1","name":"Araçatuba","sort_order":1},
  {"id":"city-2","name":"Birigui","sort_order":2},
  {"id":"city-3","name":"Bilac","sort_order":3},
  {"id":"city-4","name":"Gabriel Monteiro","sort_order":4},
  {"id":"city-5","name":"Coroados e Guararapes","sort_order":5}
]'::jsonb;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_image_url TEXT NOT NULL DEFAULT '/images/shipping/van-ventara-aracatuba.jpg';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_image_alt TEXT NOT NULL DEFAULT 'Van de entregas expressas da Ótica Ventara Eyewear em Araçatuba e região';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_focal_point TEXT NOT NULL DEFAULT 'center right';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_gradient_intensity TEXT NOT NULL DEFAULT 'strong';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_show_timeframe BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_timeframe TEXT DEFAULT 'Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_show_conditions BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS regional_conditions TEXT DEFAULT 'Opção de retirada gratuita no balcão da loja física ou entrega direta';

ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_is_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_title TEXT NOT NULL DEFAULT 'Prazo Estimado';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_text TEXT NOT NULL DEFAULT 'Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)';

ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_is_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_title TEXT NOT NULL DEFAULT 'Enviamos para todo o Brasil';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_subtitle TEXT NOT NULL DEFAULT 'Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_tracking_note TEXT NOT NULL DEFAULT 'Todo envio nacional segue com código de rastreamento ponta a ponta.';
ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_cards JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Insere registro padrão caso a tabela esteja vazia
INSERT INTO public.shipping_page_settings (is_enabled, slug)
SELECT true, 'entregas'
WHERE NOT EXISTS (SELECT 1 FROM public.shipping_page_settings LIMIT 1);

-- 4. Atualiza os dados com suporte a fotos nos cartões nacionais e redação neutra
UPDATE public.shipping_page_settings
SET
  national_title = 'Enviamos para todo o Brasil',
  national_subtitle = 'Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.',
  national_tracking_note = 'Todo envio nacional segue com código de rastreamento ponta a ponta.',
  national_cards = '[
    {
      "id": "nat-card-correios",
      "title": "Correios (Sedex e PAC)",
      "description": "Entregas em todo o Brasil com código de rastreamento oficial.",
      "delivery_time": "Sedex: 1 a 4 dias úteis · PAC: 5 a 12 dias úteis",
      "badge": "Todo o Brasil",
      "icon_name": "mail",
      "image_url": "/images/shipping/transportadora-sedex.png",
      "image_alt": "Van amarela de encomendas Sedex dos Correios em trânsito",
      "image_position": "center",
      "image_overlay": "medium",
      "image_caption": "Logística Postal",
      "show_image": true,
      "is_active": true
    },
    {
      "id": "nat-card-transportadoras",
      "title": "Transportadoras Rodoviárias",
      "description": "Transportadoras rodoviárias utilizadas para rotas expressas interestaduais com alta agilidade.",
      "delivery_time": "Em média 2 a 6 dias úteis conforme destino",
      "badge": "Rotas Expressas",
      "icon_name": "truck",
      "image_url": "/images/shipping/envio-brasil-azul-cargo.png",
      "image_alt": "Veículo e malha de transporte rodoviário expresso",
      "image_position": "bottom",
      "image_overlay": "medium",
      "image_caption": "Transporte Terrestre",
      "show_image": true,
      "is_active": true
    },
    {
      "id": "nat-card-aereo",
      "title": "Envio Aéreo para Destinos Distantes",
      "description": "Para outros estados, quando necessário, utilizamos transporte aéreo por meio das transportadoras e dos Correios para acelerar a entrega.",
      "delivery_time": "Em média 2 a 5 dias úteis",
      "badge": "Alta Velocidade",
      "icon_name": "plane",
      "image_url": "/images/shipping/transportadora-gollog.jpg",
      "image_alt": "Aeronave cargueira conectando aeroportos nacionais",
      "image_position": "center",
      "image_overlay": "medium",
      "image_caption": "Conexão Aérea",
      "show_image": true,
      "is_active": true
    }
  ]'::jsonb,
  updated_at = now()
WHERE id IS NOT NULL;
