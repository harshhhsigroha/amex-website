-- Allow portal users to read their client's white label config
CREATE POLICY "Portal users can view their client white label"
ON public.client_white_label
FOR SELECT
USING (client_id = get_portal_client_id(auth.uid()));

-- Allow clients to read their own white label
CREATE POLICY "Clients can read their own white label"
ON public.client_white_label
FOR SELECT
USING (client_id = get_client_id(auth.uid()));