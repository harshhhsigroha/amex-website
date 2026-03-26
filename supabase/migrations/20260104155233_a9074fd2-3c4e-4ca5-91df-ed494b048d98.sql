-- Create admin permissions table
CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  can_manage_clients boolean NOT NULL DEFAULT false,
  can_manage_candidates boolean NOT NULL DEFAULT false,
  can_generate_invoices boolean NOT NULL DEFAULT false,
  can_generate_self_bills boolean NOT NULL DEFAULT false,
  can_view_history boolean NOT NULL DEFAULT false,
  can_view_dashboard boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all permissions
CREATE POLICY "Super admins can manage permissions"
ON public.admin_permissions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Admins can view their own permissions
CREATE POLICY "Admins can view own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to check specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_super_admin boolean;
  _has_perm boolean;
BEGIN
  -- Super admins have all permissions
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'super_admin'
  ) INTO _is_super_admin;
  
  IF _is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Check specific permission for regular admins
  EXECUTE format(
    'SELECT COALESCE((SELECT %I FROM public.admin_permissions WHERE user_id = $1), false)',
    _permission
  ) INTO _has_perm USING _user_id;
  
  RETURN COALESCE(_has_perm, false);
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();