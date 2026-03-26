-- Allow portal users to view invoices for their linked client
CREATE POLICY "Portal users can view their client invoices"
  ON public.invoices FOR SELECT
  USING (client_id = get_portal_client_id(auth.uid()));

-- Allow portal users to view invoice line items for their client's invoices
CREATE POLICY "Portal users can view invoice line items"
  ON public.invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
        AND invoices.client_id = get_portal_client_id(auth.uid())
    )
  );

-- Allow portal users to view their own client record
CREATE POLICY "Portal users can view their client record"
  ON public.clients FOR SELECT
  USING (id = get_portal_client_id(auth.uid()));

-- Allow portal users to view their files
CREATE POLICY "Portal users can view their files"
  ON public.files FOR SELECT
  USING (
    is_portal_user(auth.uid())
    AND client_id = get_portal_client_id(auth.uid())
  );

-- Allow portal users to create support tickets
CREATE POLICY "Portal users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (
    is_portal_user(auth.uid())
    AND user_id = auth.uid()
  );

-- Allow portal users to view their own tickets
CREATE POLICY "Portal users can view their tickets"
  ON public.support_tickets FOR SELECT
  USING (
    is_portal_user(auth.uid())
    AND user_id = auth.uid()
  );
