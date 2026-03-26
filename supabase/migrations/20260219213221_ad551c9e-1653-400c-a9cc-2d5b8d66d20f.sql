-- Allow clients to insert invoices for their sub-clients
CREATE POLICY "Clients can insert invoices for sub-clients"
ON public.invoices FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients 
    WHERE parent_client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to view invoices for their sub-clients
CREATE POLICY "Clients can view sub-client invoices"
ON public.invoices FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients 
    WHERE parent_client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to insert invoice line items for sub-client invoices
CREATE POLICY "Clients can insert line items for sub-client invoices"
ON public.invoice_line_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.clients c ON c.id = i.client_id
    WHERE i.id = invoice_line_items.invoice_id
      AND c.parent_client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to view invoice line items for sub-client invoices
CREATE POLICY "Clients can view sub-client invoice line items"
ON public.invoice_line_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.clients c ON c.id = i.client_id
    WHERE i.id = invoice_line_items.invoice_id
      AND c.parent_client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to upload files for sub-clients
CREATE POLICY "Clients can insert files for sub-clients"
ON public.files FOR INSERT
WITH CHECK (
  is_client(auth.uid()) AND
  client_id IN (
    SELECT id FROM public.clients 
    WHERE parent_client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to view files for sub-clients
CREATE POLICY "Clients can view files for sub-clients"
ON public.files FOR SELECT
USING (
  is_client(auth.uid()) AND
  client_id IN (
    SELECT id FROM public.clients 
    WHERE parent_client_id = get_client_id(auth.uid())
  )
);