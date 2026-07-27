DROP INDEX IF EXISTS public.orders_shopify_order_id_unique;
DROP INDEX IF EXISTS public.subscriptions_shopify_order_id_unique;

CREATE UNIQUE INDEX IF NOT EXISTS orders_shopify_order_id_unique
  ON public.orders (shopify_order_id);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_shopify_order_id_unique
  ON public.subscriptions (shopify_order_id);