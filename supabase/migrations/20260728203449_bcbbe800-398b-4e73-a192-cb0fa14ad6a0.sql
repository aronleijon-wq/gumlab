ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_invoice_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'shopify';

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'shopify';

UPDATE public.orders SET provider = 'shopify' WHERE provider IS NULL OR provider = '';
UPDATE public.subscriptions SET provider = 'shopify' WHERE provider IS NULL OR provider = '';

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_key ON public.orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_invoice_id_key ON public.orders(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_key ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;