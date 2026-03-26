-- Create client_users table to link clients to auth users
CREATE TABLE public.client_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Enable RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a client
CREATE OR REPLACE FUNCTION public.is_client(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.client_users
    WHERE user_id = _user_id
  )
$$;

-- Function to get client_id for a user
CREATE OR REPLACE FUNCTION public.get_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT client_id
  FROM public.client_users
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for client_users
CREATE POLICY "Admins can manage client_users"
ON public.client_users
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Clients can view their own link"
ON public.client_users
FOR SELECT
USING (auth.uid() = user_id);

-- Update clients table RLS to allow clients to see their own company
CREATE POLICY "Clients can view their own client record"
ON public.clients
FOR SELECT
USING (id = get_client_id(auth.uid()));

-- Update invoices table RLS to allow clients to see their invoices
CREATE POLICY "Clients can view their own invoices"
ON public.invoices
FOR SELECT
USING (client_id = get_client_id(auth.uid()));

-- Create a view for invoice line items (we'll need to store these)
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  emp_id TEXT NOT NULL,
  firstname TEXT NOT NULL,
  surname TEXT NOT NULL,
  timesheet_id TEXT,
  hours NUMERIC NOT NULL,
  pay_rate NUMERIC NOT NULL,
  pay_amount NUMERIC NOT NULL,
  vat NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  umbrella_company TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on line items
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS for invoice line items
CREATE POLICY "Admins can manage invoice_line_items"
ON public.invoice_line_items
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Clients can view their invoice line items"
ON public.invoice_line_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_line_items.invoice_id
    AND invoices.client_id = get_client_id(auth.uid())
  )
);