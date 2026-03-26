
-- Create table to store global configurable invoice settings
CREATE TABLE public.invoice_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Master Invoice Payment Details
  bank_name text NOT NULL DEFAULT 'PayCore by FirmFlow',
  sort_code text NOT NULL DEFAULT '04-06-05',
  account_number text NOT NULL DEFAULT '2197155',
  remittance_email text NOT NULL DEFAULT 'accounts@firmflow.com',
  vat_number text NOT NULL DEFAULT 'GB 123456789',
  -- Self-Bill Invoice To Address
  self_bill_company_name text NOT NULL DEFAULT 'PayCore by FirmFlow',
  self_bill_address_line1 text NOT NULL DEFAULT 'Suite 8 Pemberton House',
  self_bill_address_line2 text NOT NULL DEFAULT 'Stafford Park 1',
  self_bill_city text NOT NULL DEFAULT 'Telford',
  self_bill_postcode text NOT NULL DEFAULT 'TF3 3BD',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Only one settings row ever
INSERT INTO public.invoice_settings DEFAULT VALUES;

-- Enable RLS
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Super admins can manage settings
CREATE POLICY "Super admins can manage invoice_settings"
  ON public.invoice_settings
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- All authenticated admins/clients can read settings (needed for PDF generation)
CREATE POLICY "Admins can read invoice_settings"
  ON public.invoice_settings
  FOR SELECT
  USING (is_admin(auth.uid()) OR is_client(auth.uid()));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
