
-- Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_tier text DEFAULT 'all', -- 'all', 'starter', 'growth', 'scale', 'team'
  priority text DEFAULT 'info', -- 'info', 'warning', 'critical'
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Clients can read active announcements" ON public.announcements FOR SELECT
  USING (is_client(auth.uid()) AND is_active = true);

CREATE POLICY "Portal users can read active announcements" ON public.announcements FOR SELECT
  USING (is_portal_user(auth.uid()) AND is_active = true);

-- Client onboarding checklist table
CREATE TABLE public.client_onboarding_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  step_label text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  completed_by uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, step_key)
);

ALTER TABLE public.client_onboarding_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage onboarding checklist" ON public.client_onboarding_checklist FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Add first_response_at to support_tickets for SLA tracking
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS first_response_at timestamp with time zone;

-- Add sla_target_hours for per-priority SLA targets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS sla_target_hours integer;
