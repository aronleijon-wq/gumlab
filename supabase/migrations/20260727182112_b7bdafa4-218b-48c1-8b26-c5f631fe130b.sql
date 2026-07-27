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

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;