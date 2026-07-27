ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS fulfillment_status text,
  ADD COLUMN IF NOT EXISTS details jsonb;