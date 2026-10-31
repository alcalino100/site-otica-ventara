-- ============================================================================
-- MIGRATION: 20261031000003_update_order_status_constraint_ready_for_pickup.sql
-- PROJETO: Ótica Ventara — Atualização de Constraint para Status ready_for_pickup
-- ============================================================================

-- 1. Remove a constraint antiga de status caso exista
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Recria a constraint incluindo explicitamente 'ready_for_pickup'
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending',            -- Aguardando checkout / contato
  'awaiting_payment',   -- Pix ou boleto gerado
  'paid',               -- Pagamento aprovado
  'preparing',          -- Armação em montagem de lentes
  'ready_for_pickup',   -- Pronto para retirada no balcão da loja física
  'shipped',            -- Despachado com rastreamento postal
  'delivered',          -- Entregue / Retirado com sucesso
  'cancelled',          -- Cancelado
  'refunded'            -- Reembolsado
));

-- 3. Migra retroativamente pedidos marcados como retirada que estavam gravados como 'shipped'
UPDATE public.orders
SET status = 'ready_for_pickup', tracking_number = NULL
WHERE status = 'shipped' 
  AND (notes ILIKE '%[RETIRADA NA LOJA]%' OR shipping_address->>'delivery_type' = 'pickup');

COMMENT ON CONSTRAINT orders_status_check ON public.orders IS 'Garante consistência entre status do painel admin e fluxo público de rastreamento';
