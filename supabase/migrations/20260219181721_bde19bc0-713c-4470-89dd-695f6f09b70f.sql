-- Allow PayCore clients to insert invoices and line items for their own client_id
CREATE POLICY "Clients can insert their own invoices"
ON public.invoices
FOR INSERT
WITH CHECK (client_id = get_client_id(auth.uid()));

CREATE POLICY "Clients can insert invoice line items"
ON public.invoice_line_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.client_id = get_client_id(auth.uid())
  )
);

-- Allow clients to read and manage their own candidates
CREATE POLICY "Clients can read candidates"
ON public.candidates
FOR SELECT
USING (is_client(auth.uid()));

CREATE POLICY "Clients can insert candidates"
ON public.candidates
FOR INSERT
WITH CHECK (is_client(auth.uid()));

CREATE POLICY "Clients can update candidates"
ON public.candidates
FOR UPDATE
USING (is_client(auth.uid()));

-- Allow clients to insert self-billed invoices
CREATE POLICY "Clients can insert self_billed_invoices"
ON public.self_billed_invoices
FOR INSERT
WITH CHECK (is_client(auth.uid()));

CREATE POLICY "Clients can read self_billed_invoices"
ON public.self_billed_invoices
FOR SELECT
USING (is_client(auth.uid()));

-- Allow clients to read and manage their own files
CREATE POLICY "Clients can insert files"
ON public.files
FOR INSERT
WITH CHECK (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

CREATE POLICY "Clients can delete their own files"
ON public.files
FOR DELETE
USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));