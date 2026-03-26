
-- ============================================================
-- UK GDPR / Security Compliance Fixes
-- ============================================================

-- 1. FIX: onboarding_form_config is publicly readable without auth.
-- The onboarding PUBLIC form still needs to be readable by candidates
-- (unauthenticated), but we tighten the policies so that only client-
-- specific forms are accessible publicly (needed for /onboarding/:clientId).
-- We remove the overly broad "Public can read global onboarding config" policy
-- since the public form falls back gracefully if not found.

DROP POLICY IF EXISTS "Public can read global onboarding config" ON public.onboarding_form_config;
DROP POLICY IF EXISTS "Public can read client onboarding config" ON public.onboarding_form_config;

-- Allow unauthenticated reads ONLY for client-specific onboarding forms
-- (needed for the public /onboarding/:clientId route). Global configs are
-- only needed by admins who are already authenticated.
CREATE POLICY "Public can read client-specific onboarding forms"
  ON public.onboarding_form_config
  FOR SELECT
  USING (
    client_id IS NOT NULL
    AND form_type LIKE 'candidate_%'
  );

-- Authenticated admins can still read global forms
CREATE POLICY "Admins can read global onboarding config"
  ON public.onboarding_form_config
  FOR SELECT
  USING (
    client_id IS NULL
    AND is_admin(auth.uid())
  );

-- 2. FIX: self_billed_invoices - clients can read ALL self-billed invoices
-- (is_client() check is too broad). Add a client_id column so each agency's
-- invoices are isolated.

ALTER TABLE public.self_billed_invoices
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Drop the overly broad client policies
DROP POLICY IF EXISTS "Clients can insert self_billed_invoices" ON public.self_billed_invoices;
DROP POLICY IF EXISTS "Clients can read self_billed_invoices" ON public.self_billed_invoices;

-- Replace with client-isolated policies
CREATE POLICY "Clients can insert their own self_billed_invoices"
  ON public.self_billed_invoices
  FOR INSERT
  WITH CHECK (
    is_client(auth.uid())
    AND (client_id = get_client_id(auth.uid()) OR client_id IS NULL)
  );

CREATE POLICY "Clients can read their own self_billed_invoices"
  ON public.self_billed_invoices
  FOR SELECT
  USING (
    is_client(auth.uid())
    AND client_id = get_client_id(auth.uid())
  );

-- Admins retain full access (already covered by existing admin policies)

-- 3. GDPR Article 32: Create an index to help performance on the audit_log
-- (audit trail is required under UK GDPR for data breach detection)
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON public.audit_log(event_type);

-- 4. Portal users update own tickets (self-service — good for data accuracy under GDPR)
DROP POLICY IF EXISTS "Portal users can update their tickets" ON public.support_tickets;
CREATE POLICY "Portal users can update their tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (
    is_portal_user(auth.uid())
    AND user_id = auth.uid()
  );
