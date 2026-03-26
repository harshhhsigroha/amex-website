
-- Fix SQL injection risk: replace dynamic SQL in has_permission() with a safe CASE statement
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_super_admin boolean;
  _has_perm boolean := false;
  _perms public.admin_permissions%ROWTYPE;
BEGIN
  -- Super admins have all permissions
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'super_admin'
  ) INTO _is_super_admin;
  
  IF _is_super_admin THEN
    RETURN true;
  END IF;

  -- Fetch the permissions row for this admin
  SELECT * INTO _perms
  FROM public.admin_permissions
  WHERE user_id = _user_id
  LIMIT 1;

  -- Safe CASE lookup — no dynamic SQL, no injection risk
  _has_perm := CASE _permission
    WHEN 'can_manage_clients'     THEN COALESCE(_perms.can_manage_clients,     false)
    WHEN 'can_manage_candidates'  THEN COALESCE(_perms.can_manage_candidates,  false)
    WHEN 'can_generate_invoices'  THEN COALESCE(_perms.can_generate_invoices,  false)
    WHEN 'can_generate_self_bills'THEN COALESCE(_perms.can_generate_self_bills,false)
    WHEN 'can_view_history'       THEN COALESCE(_perms.can_view_history,       false)
    WHEN 'can_view_dashboard'     THEN COALESCE(_perms.can_view_dashboard,     false)
    ELSE false
  END;

  RETURN COALESCE(_has_perm, false);
END;
$$;
