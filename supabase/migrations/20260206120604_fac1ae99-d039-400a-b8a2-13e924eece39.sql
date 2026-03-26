-- Add DELETE policy for invoices (super admins only)
CREATE POLICY "Super admins can delete invoices" 
ON public.invoices 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add DELETE policy for self_billed_invoices (super admins only)
CREATE POLICY "Super admins can delete self_billed_invoices" 
ON public.self_billed_invoices 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add DELETE policy for invoice_line_items (super admins only)
CREATE POLICY "Super admins can delete invoice_line_items" 
ON public.invoice_line_items 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));