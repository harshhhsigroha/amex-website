
-- Allow clients to update invoice_settings (not just read)
CREATE POLICY "Clients can update invoice_settings"
ON public.invoice_settings
FOR UPDATE
USING (is_client(auth.uid()));
