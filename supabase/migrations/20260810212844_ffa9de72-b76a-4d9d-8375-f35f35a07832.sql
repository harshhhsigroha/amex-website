CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
  ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) END
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
  ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin')) END
$$;

CREATE OR REPLACE FUNCTION public.is_client(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
  ELSE EXISTS (SELECT 1 FROM public.client_users WHERE user_id = _user_id) END
$$;

CREATE OR REPLACE FUNCTION public.is_candidate(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
  ELSE EXISTS (SELECT 1 FROM public.candidate_users WHERE user_id = _user_id) END
$$;

CREATE OR REPLACE FUNCTION public.is_portal_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN false
  ELSE EXISTS (SELECT 1 FROM public.portal_users WHERE user_id = _user_id) END
$$;

CREATE OR REPLACE FUNCTION public.get_client_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT client_id FROM public.client_users
  WHERE user_id = _user_id AND (auth.uid() IS NULL OR _user_id = auth.uid()) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_portal_client_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT client_id FROM public.portal_users
  WHERE user_id = _user_id AND (auth.uid() IS NULL OR _user_id = auth.uid()) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT candidate_id FROM public.candidate_users
  WHERE user_id = _user_id AND (auth.uid() IS NULL OR _user_id = auth.uid()) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_emp_id(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT emp_id FROM public.candidate_users
  WHERE user_id = _user_id AND (auth.uid() IS NULL OR _user_id = auth.uid()) LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _is_super_admin boolean;
  _has_perm boolean := false;
  _perms public.admin_permissions%ROWTYPE;
BEGIN
  IF auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  ) INTO _is_super_admin;

  IF _is_super_admin THEN
    RETURN true;
  END IF;

  SELECT * INTO _perms FROM public.admin_permissions WHERE user_id = _user_id LIMIT 1;

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
$function$;