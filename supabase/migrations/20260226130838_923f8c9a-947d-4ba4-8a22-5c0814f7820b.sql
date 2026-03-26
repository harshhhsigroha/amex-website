CREATE POLICY "Clients can insert invoice_settings"
ON public.invoice_settings
FOR INSERT
WITH CHECK (is_client(auth.uid()));