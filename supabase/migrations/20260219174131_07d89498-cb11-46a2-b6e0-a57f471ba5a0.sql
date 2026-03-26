
-- Create portal_users table for end-users (clients of PayCore clients)
CREATE TABLE public.portal_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

-- Admins (PayCore team) can manage all portal users
CREATE POLICY "Admins can manage portal_users"
  ON public.portal_users
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Portal users can view their own link
CREATE POLICY "Portal users can view their own link"
  ON public.portal_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Helper function to get portal client id
CREATE OR REPLACE FUNCTION public.get_portal_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id
  FROM public.portal_users
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Helper function to check if user is a portal user
CREATE OR REPLACE FUNCTION public.is_portal_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_users
    WHERE user_id = _user_id
  )
$$;
