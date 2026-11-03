-- ============================================================================
-- MIGRATION: 20261103000002_national_cards_images.sql
-- PROJETO: Ótica Ventara — Fotos nos Cartões de Envio Nacional & Ajustes de Transparência
-- ============================================================================

-- Atualiza a coluna national_cards com suporte completo a fotos e textos neutros
UPDATE public.shipping_page_settings
SET
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
