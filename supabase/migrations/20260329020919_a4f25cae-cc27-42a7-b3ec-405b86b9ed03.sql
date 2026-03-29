
CREATE TABLE public.portal_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  can_view_dashboard boolean NOT NULL DEFAULT true,
  can_view_invoices boolean NOT NULL DEFAULT true,
  can_view_contractors boolean NOT NULL DEFAULT true,
  can_view_support boolean NOT NULL DEFAULT true,
  can_view_files boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (client_id)
);

ALTER TABLE public.portal_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all portal_permissions
CREATE POLICY "Admins can manage portal_permissions"
  ON public.portal_permissions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Clients can manage their own portal_permissions
CREATE POLICY "Clients can manage their own portal_permissions"
  ON public.portal_permissions FOR ALL
  TO authenticated
  USING (public.is_client(auth.uid()) AND client_id = public.get_client_id(auth.uid()))
  WITH CHECK (public.is_client(auth.uid()) AND client_id = public.get_client_id(auth.uid()));

-- Portal users can read their client's permissions
CREATE POLICY "Portal users can read their portal_permissions"
  ON public.portal_permissions FOR SELECT
  TO authenticated
  USING (client_id = public.get_portal_client_id(auth.uid()));
