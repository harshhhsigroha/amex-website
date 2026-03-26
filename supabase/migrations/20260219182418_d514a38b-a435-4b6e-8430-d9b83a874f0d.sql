
-- Create client_permissions table (controls what each PayCore client can do in the invoice tool)
CREATE TABLE public.client_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  can_generate_invoices boolean NOT NULL DEFAULT false,
  can_generate_self_bills boolean NOT NULL DEFAULT false,
  can_manage_candidates boolean NOT NULL DEFAULT false,
  can_view_history boolean NOT NULL DEFAULT false,
  can_view_dashboard boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

ALTER TABLE public.client_permissions ENABLE ROW LEVEL SECURITY;

-- PayCore admins can fully manage client permissions
CREATE POLICY "Admins can manage client_permissions"
  ON public.client_permissions
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Clients can read their own permissions
CREATE POLICY "Clients can read their own permissions"
  ON public.client_permissions
  FOR SELECT
  USING (client_id = get_client_id(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER update_client_permissions_updated_at
  BEFORE UPDATE ON public.client_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
