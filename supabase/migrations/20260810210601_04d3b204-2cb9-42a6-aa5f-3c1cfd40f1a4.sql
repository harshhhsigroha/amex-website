ALTER TABLE public.invoice_settings
  ALTER COLUMN bank_name SET DEFAULT 'AMEX Outsourcing',
  ALTER COLUMN remittance_email SET DEFAULT 'accounts@amexoutsourcing.com',
  ALTER COLUMN self_bill_company_name SET DEFAULT 'AMEX Outsourcing',
  ALTER COLUMN self_bill_address_line1 SET DEFAULT '545 Northumberland Avenue',
  ALTER COLUMN self_bill_address_line2 SET DEFAULT 'Reading, England',
  ALTER COLUMN self_bill_city SET DEFAULT '',
  ALTER COLUMN self_bill_postcode SET DEFAULT 'RG2 8NU';

UPDATE public.invoice_settings
SET
  bank_name = 'AMEX Outsourcing',
  remittance_email = 'accounts@amexoutsourcing.com',
  self_bill_company_name = 'AMEX Outsourcing',
  self_bill_address_line1 = '545 Northumberland Avenue',
  self_bill_address_line2 = 'Reading, England',
  self_bill_city = '',
  self_bill_postcode = 'RG2 8NU',
  updated_at = now();