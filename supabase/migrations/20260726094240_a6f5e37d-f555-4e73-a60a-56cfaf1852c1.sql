
-- 1. Schema changes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS shopify_order_id text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'SEK';

ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_shopify_order_id_key
  ON public.orders (shopify_order_id) WHERE shopify_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders (lower(email));

-- 2. RLS: allow reads/updates when the order's email matches the signed-in user's email
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  );

DROP POLICY IF EXISTS "Users update own orders" ON public.orders;
CREATE POLICY "Users update own orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  );

-- service_role already has ALL via existing grant; ensure it is present
GRANT ALL ON public.orders TO service_role;

-- 3. Extend handle_new_user to backfill orders by email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Attach any prior orders that share this email
  UPDATE public.orders
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND email IS NOT NULL
     AND lower(email) = lower(NEW.email);

  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists on auth.users (in case it wasn't created before)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
