ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS shopify_order_id text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'SEK',
  ADD COLUMN IF NOT EXISTS plan_title text,
  ADD COLUMN IF NOT EXISTS cadence_days integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone;

ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_shopify_order_id_key
  ON public.subscriptions (shopify_order_id) WHERE shopify_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON public.subscriptions (lower(email));

DROP POLICY IF EXISTS "Users manage own subs" ON public.subscriptions;

CREATE POLICY "Users read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  );

CREATE POLICY "Users update own subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (email IS NOT NULL AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  );

CREATE POLICY "Users insert own subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own subscriptions" ON public.subscriptions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;

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
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        updated_at = now();

  UPDATE public.orders
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND email IS NOT NULL
     AND NEW.email IS NOT NULL
     AND lower(email) = lower(NEW.email);

  UPDATE public.subscriptions
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND email IS NOT NULL
     AND NEW.email IS NOT NULL
     AND lower(email) = lower(NEW.email);

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();