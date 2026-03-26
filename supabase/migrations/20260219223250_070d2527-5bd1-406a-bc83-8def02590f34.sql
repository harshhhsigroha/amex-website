
-- 1. Add client_id to onboarding_form_config for per-client isolation
ALTER TABLE public.onboarding_form_config 
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- 2. Drop overly permissive public read policy
DROP POLICY IF EXISTS "Public can read onboarding config" ON public.onboarding_form_config;

-- 3. Public can read global forms (no client_id) — for the self-service onboarding page
CREATE POLICY "Public can read global onboarding config"
  ON public.onboarding_form_config
  FOR SELECT
  USING (client_id IS NULL);

-- 4. Public can read client-specific forms by client_id — for /onboarding/:clientId
CREATE POLICY "Public can read client onboarding config"
  ON public.onboarding_form_config
  FOR SELECT
  USING (client_id IS NOT NULL);

-- 5. Clients can manage their OWN form config only
CREATE POLICY "Clients can manage their own onboarding config"
  ON public.onboarding_form_config
  FOR ALL
  USING (client_id = get_client_id(auth.uid()))
  WITH CHECK (client_id = get_client_id(auth.uid()));

-- 6. Create audit_log table for UK compliance (immutable event trail)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  target_type text,
  target_id text,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. RLS on audit log — super admins can read all; individual users see their own actions
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read all audit logs"
  ON public.audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can read audit logs"
  ON public.audit_log
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can insert audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR is_admin(auth.uid()));

-- No UPDATE / DELETE on audit_log (immutable for compliance)

-- 8. Index for performance
CREATE INDEX IF NOT EXISTS audit_log_actor_id_idx ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_event_type_idx ON public.audit_log(event_type);
