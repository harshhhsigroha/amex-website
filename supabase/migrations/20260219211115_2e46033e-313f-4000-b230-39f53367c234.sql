
-- Add parent_client_id to clients to allow agency clients (Tony) to have
-- their own sub-clients for invoice addressing purposes.
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS parent_client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Index for fast lookups of sub-clients by parent
CREATE INDEX IF NOT EXISTS idx_clients_parent_client_id
  ON public.clients(parent_client_id);

-- RLS: Client users can view sub-clients they own (where parent_client_id = their client_id)
CREATE POLICY "Clients can view their sub-clients"
  ON public.clients
  FOR SELECT
  USING (parent_client_id = get_client_id(auth.uid()));

-- RLS: Client users can insert sub-clients under their own client_id
CREATE POLICY "Clients can insert sub-clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (parent_client_id = get_client_id(auth.uid()));

-- RLS: Client users can update their own sub-clients
CREATE POLICY "Clients can update their sub-clients"
  ON public.clients
  FOR UPDATE
  USING (parent_client_id = get_client_id(auth.uid()));

-- RLS: Client users can delete their own sub-clients
CREATE POLICY "Clients can delete their sub-clients"
  ON public.clients
  FOR DELETE
  USING (parent_client_id = get_client_id(auth.uid()));
