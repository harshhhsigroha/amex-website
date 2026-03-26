
-- Allow client_users to update support tickets raised by their portal_users
-- (Tony can mark end-client tickets as resolved)
CREATE POLICY "Clients can update their end_clients tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  is_client(auth.uid()) AND
  user_id IN (
    SELECT pu.user_id FROM public.portal_users pu
    WHERE pu.client_id = get_client_id(auth.uid())
  )
);

-- Allow client_users to insert messages on their end-clients' tickets
CREATE POLICY "Clients can message on end_client tickets"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  is_client(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    JOIN public.portal_users pu ON pu.user_id = st.user_id
    WHERE st.id = support_messages.ticket_id
    AND pu.client_id = get_client_id(auth.uid())
  )
);

-- Allow client_users to read messages on their end-clients' tickets
CREATE POLICY "Clients can read end_client ticket messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (
  is_client(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    JOIN public.portal_users pu ON pu.user_id = st.user_id
    WHERE st.id = support_messages.ticket_id
    AND pu.client_id = get_client_id(auth.uid())
  )
);

-- Allow client_users to view their end-clients' tickets
CREATE POLICY "Clients can view end_client tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  is_client(auth.uid()) AND
  user_id IN (
    SELECT pu.user_id FROM public.portal_users pu
    WHERE pu.client_id = get_client_id(auth.uid())
  )
);
