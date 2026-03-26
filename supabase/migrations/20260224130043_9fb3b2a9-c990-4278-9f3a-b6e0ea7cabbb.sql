
-- 1. Add hourly_rate to candidates
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT NULL;

-- 2. Add require_timesheet_approval to client_permissions
ALTER TABLE public.client_permissions ADD COLUMN IF NOT EXISTS require_timesheet_approval boolean NOT NULL DEFAULT false;

-- 3. Create time_logs table
CREATE TABLE public.time_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  emp_id text NOT NULL,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  clock_in_lat numeric,
  clock_in_lng numeric,
  clock_in_address text,
  clock_out_lat numeric,
  clock_out_lng numeric,
  clock_out_address text,
  total_hours numeric,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  financial_week integer NOT NULL,
  financial_year text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with time_logs
CREATE POLICY "Admins can manage time_logs"
  ON public.time_logs FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Clients can view their own time_logs
CREATE POLICY "Clients can view their time_logs"
  ON public.time_logs FOR SELECT
  USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- Clients can view sub-client time_logs
CREATE POLICY "Clients can view sub-client time_logs"
  ON public.time_logs FOR SELECT
  USING (is_client(auth.uid()) AND client_id IN (
    SELECT id FROM clients WHERE parent_client_id = get_client_id(auth.uid())
  ));

-- 4. Create timesheets table
CREATE TABLE public.timesheets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  emp_id text NOT NULL,
  financial_week integer NOT NULL,
  financial_year text NOT NULL,
  total_hours numeric NOT NULL DEFAULT 0,
  hourly_rate numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, candidate_id, financial_week, financial_year)
);

ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with timesheets
CREATE POLICY "Admins can manage timesheets"
  ON public.timesheets FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Clients can view their own timesheets
CREATE POLICY "Clients can view their timesheets"
  ON public.timesheets FOR SELECT
  USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- Clients can update (approve) their own timesheets
CREATE POLICY "Clients can update their timesheets"
  ON public.timesheets FOR UPDATE
  USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- Clients can view sub-client timesheets
CREATE POLICY "Clients can view sub-client timesheets"
  ON public.timesheets FOR SELECT
  USING (is_client(auth.uid()) AND client_id IN (
    SELECT id FROM clients WHERE parent_client_id = get_client_id(auth.uid())
  ));

-- Clients can insert timesheets for their own client
CREATE POLICY "Clients can insert their timesheets"
  ON public.timesheets FOR INSERT
  WITH CHECK (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_time_logs_updated_at
  BEFORE UPDATE ON public.time_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
