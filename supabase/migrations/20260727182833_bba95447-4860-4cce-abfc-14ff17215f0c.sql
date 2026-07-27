CREATE UNIQUE INDEX IF NOT EXISTS orders_shopify_order_id_unique
  ON public.orders (shopify_order_id)
  WHERE shopify_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_shopify_order_id_unique
  ON public.subscriptions (shopify_order_id)
  WHERE shopify_order_id IS NOT NULL;