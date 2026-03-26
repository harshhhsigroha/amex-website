-- Allow admins to delete any ticket
CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Allow clients to delete their own tickets
CREATE POLICY "Clients can delete their own tickets"
  ON public.support_tickets
  FOR DELETE
  USING (user_id = auth.uid() AND is_client(auth.uid()));

-- Allow clients to delete end_client tickets in their inbox
CREATE POLICY "Clients can delete end_client tickets"
  ON public.support_tickets
  FOR DELETE
  USING (
    is_client(auth.uid())
    AND user_id IN (
      SELECT pu.user_id FROM portal_users pu
      WHERE pu.client_id = get_client_id(auth.uid())
    )
  );