
CREATE TABLE public.newsletter_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  source text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX newsletter_signups_email_key ON public.newsletter_signups (lower(email));

GRANT INSERT ON public.newsletter_signups TO anon, authenticated;
GRANT ALL ON public.newsletter_signups TO service_role;

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up" ON public.newsletter_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254);
