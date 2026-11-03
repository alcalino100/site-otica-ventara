-- ============================================================================
-- MIGRATION: 20261103000001_shipping_page_refactor.sql
-- PROJETO: Ótica Ventara — Refatoração da Página /entregas e Bloco Regional 100% Editável
-- ============================================================================

-- Adiciona novas colunas à tabela shipping_page_settings se não existirem
DO $$ BEGIN
  -- Hero Light Theme
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT NOT NULL DEFAULT 'ESTRUTURA LOGÍSTICA & RASTREAMENTO';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_title_line1 TEXT NOT NULL DEFAULT 'Rede de Entregas';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_title_line2 TEXT NOT NULL DEFAULT 'Ventara';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_secondary_cta_text TEXT NOT NULL DEFAULT 'Ver cidades atendidas';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_secondary_cta_url TEXT NOT NULL DEFAULT '#bloco-regional';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT '/images/shipping/hero-glasses-ventara.jpg';

  -- Cards de Destaque
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

  -- Bloco Regional 100% Editável
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

  -- Card Prazo Estimado
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_is_enabled BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_title TEXT NOT NULL DEFAULT 'Prazo Estimado';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS estimated_timeframe_text TEXT NOT NULL DEFAULT 'Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)';

  -- Bloco Nacional & Cartões
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_is_enabled BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_subtitle TEXT NOT NULL DEFAULT 'Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_tracking_note TEXT NOT NULL DEFAULT 'Todo envio nacional segue com código de rastreamento ponta a ponta e seguro de transporte.';
  ALTER TABLE public.shipping_page_settings ADD COLUMN IF NOT EXISTS national_cards JSONB NOT NULL DEFAULT '[
    {
      "id": "nat-card-correios",
      "title": "Correios (Sedex e PAC)",
      "description": "Alcance completo em 100% dos municípios do Brasil com código de rastreamento oficial.",
      "delivery_time": "Sedex: 1 a 4 dias úteis · PAC: 5 a 12 dias úteis",
      "badge": "Todo o Brasil",
      "icon_name": "mail",
      "is_active": true
    },
    {
      "id": "nat-card-transportadoras",
      "title": "Transportadoras Rodoviárias",
      "description": "Operadores logísticos parceiros selecionados para rotas expressas interestaduais com alta segurança.",
      "delivery_time": "Em média 2 a 6 dias úteis conforme destino",
      "badge": "Rotas Expressas",
      "icon_name": "truck",
      "is_active": true
    },
    {
      "id": "nat-card-aereo",
      "title": "Envio Aéreo para Destinos Distantes",
      "description": "Para outros estados, quando necessário, utilizamos transporte aéreo por meio das transportadoras e dos Correios para acelerar a entrega.",
      "delivery_time": "Em média 2 a 5 dias úteis",
      "badge": "Alta Velocidade",
      "icon_name": "plane",
      "is_active": true
    }
  ]'::jsonb;
END $$;

-- Atualiza o registro existente com os novos campos preenchidos
UPDATE public.shipping_page_settings
SET
  hero_badge_text = 'ESTRUTURA LOGÍSTICA & RASTREAMENTO',
  hero_title_line1 = 'Rede de Entregas',
  hero_title_line2 = 'Ventara',
  hero_secondary_cta_text = 'Ver cidades atendidas',
  hero_secondary_cta_url = '#bloco-regional',
  hero_image_url = '/images/shipping/hero-glasses-ventara.jpg',
  regional_badge_text = 'LOGÍSTICA PRÓPRIA REGIONAL',
  regional_title_part1 = 'Entrega Expressa em',
  regional_title_part2 = 'Araçatuba e Região',
  regional_cities_heading = 'CIDADES ATENDIDAS COM ROTA LOCAL',
  regional_cities = '[
    {"id":"city-1","name":"Araçatuba","sort_order":1},
    {"id":"city-2","name":"Birigui","sort_order":2},
    {"id":"city-3","name":"Bilac","sort_order":3},
    {"id":"city-4","name":"Gabriel Monteiro","sort_order":4},
    {"id":"city-5","name":"Coroados e Guararapes","sort_order":5}
  ]'::jsonb,
  regional_image_url = '/images/shipping/van-ventara-aracatuba.jpg',
  regional_focal_point = 'center right',
  regional_gradient_intensity = 'strong',
  estimated_timeframe_title = 'Prazo Estimado',
  estimated_timeframe_text = 'Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)',
  national_title = 'Enviamos para todo o Brasil',
  national_subtitle = 'Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.',
  updated_at = now()
WHERE id IS NOT NULL;
