-- Grant full client permissions to the AMEX Outsourcing client
INSERT INTO public.client_permissions (client_id, can_generate_invoices, can_generate_self_bills, can_manage_candidates, can_view_dashboard, can_view_history, require_timesheet_approval)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  true, true, true, true, true, false
)
ON CONFLICT (client_id) DO UPDATE SET
  can_generate_invoices = true,
  can_generate_self_bills = true,
  can_manage_candidates = true,
  can_view_dashboard = true,
  can_view_history = true;