ALTER TABLE public.portal_users 
ADD COLUMN IF NOT EXISTS sub_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;