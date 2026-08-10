DROP POLICY IF EXISTS "Clients can insert invoice_settings" ON public.invoice_settings;
DROP POLICY IF EXISTS "Clients can update invoice_settings" ON public.invoice_settings;

CREATE POLICY "Admins can insert invoice_settings"
ON public.invoice_settings FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update invoice_settings"
ON public.invoice_settings FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));