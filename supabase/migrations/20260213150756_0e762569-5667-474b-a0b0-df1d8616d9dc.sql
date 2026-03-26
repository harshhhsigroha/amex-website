
-- Table to store onboarding form configuration
CREATE TABLE public.onboarding_form_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_name text NOT NULL DEFAULT 'Candidate Registration',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_form_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage config
CREATE POLICY "Admins can manage onboarding config"
ON public.onboarding_form_config
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Public can read config (needed for the public onboarding form)
CREATE POLICY "Public can read onboarding config"
ON public.onboarding_form_config
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_form_config_updated_at
BEFORE UPDATE ON public.onboarding_form_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
