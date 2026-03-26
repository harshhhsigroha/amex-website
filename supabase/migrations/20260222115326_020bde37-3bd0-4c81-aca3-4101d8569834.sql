
-- Allow anyone to look up a client's white-label config by custom_domain
-- This is needed so the app can detect which client owns the domain
-- before the user has authenticated
CREATE POLICY "Public can lookup white label by domain"
ON public.client_white_label
FOR SELECT
USING (custom_domain IS NOT NULL AND enabled = true);
