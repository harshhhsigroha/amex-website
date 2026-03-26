-- Add form_type to onboarding_form_config to support separate forms for company and end user
ALTER TABLE public.onboarding_form_config 
ADD COLUMN IF NOT EXISTS form_type text NOT NULL DEFAULT 'candidate';

-- Add a unique constraint so we can upsert by form_type
ALTER TABLE public.onboarding_form_config
ADD CONSTRAINT onboarding_form_config_form_type_unique UNIQUE (form_type);
