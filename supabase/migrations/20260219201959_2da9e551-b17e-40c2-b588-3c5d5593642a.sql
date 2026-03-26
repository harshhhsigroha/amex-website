
-- Allow clients to manage portal_users scoped to their own client_id
-- (so Tony can add/remove his end-clients from /ops)
CREATE POLICY "Clients can manage their own portal_users"
ON public.portal_users
FOR ALL
TO authenticated
USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()))
WITH CHECK (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- Also allow clients to manage portal_users INSERT separately (belt and braces)
-- Already covered by the ALL policy above, but ensure insert is accessible
-- via the edge function (service role handles creation, client_user manages link deletion)
