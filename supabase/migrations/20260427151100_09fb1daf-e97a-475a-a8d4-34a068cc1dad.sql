-- Tighten EXECUTE permissions on SECURITY DEFINER functions
-- Revoke from PUBLIC and anon; grant only where needed

-- RLS helper functions: needed by authenticated users (used inside RLS policies on their behalf)
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_client(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_client(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_candidate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_candidate(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_portal_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_portal_user(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_client_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_client_id(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_portal_client_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_portal_client_id(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_candidate_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_candidate_id(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_candidate_emp_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_candidate_emp_id(uuid) TO authenticated, service_role;

-- Trigger-only functions: never called directly via API; revoke from everyone except service_role
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_audit_event() FROM PUBLIC, anon, authenticated;