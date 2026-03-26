
-- Client Plans table: tracks the subscription plan for each PayCore client
CREATE TABLE public.client_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'starter',
  plan_tier text NOT NULL DEFAULT 'starter', -- starter, pro, enterprise
  monthly_fee numeric NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly', -- monthly, annual
  status text NOT NULL DEFAULT 'active', -- active, suspended, cancelled, trial
  trial_ends_at timestamp with time zone,
  next_billing_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage client_plans"
  ON public.client_plans FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can read client_plans"
  ON public.client_plans FOR SELECT
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_client_plans_updated_at
  BEFORE UPDATE ON public.client_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client payment records (invoices from PayCore to their clients)
CREATE TABLE public.client_billing_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_billing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage client_billing_records"
  ON public.client_billing_records FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can read client_billing_records"
  ON public.client_billing_records FOR SELECT
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_client_billing_records_updated_at
  BEFORE UPDATE ON public.client_billing_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- White label settings per client
CREATE TABLE public.client_white_label (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  brand_name text,
  logo_url text,
  primary_color text DEFAULT '#6366f1',
  secondary_color text DEFAULT '#8b5cf6',
  custom_domain text,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_white_label ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage client_white_label"
  ON public.client_white_label FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can read client_white_label"
  ON public.client_white_label FOR SELECT
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_client_white_label_updated_at
  BEFORE UPDATE ON public.client_white_label
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
