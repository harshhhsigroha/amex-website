
-- 1) candidate_users table
CREATE TABLE public.candidate_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  candidate_id uuid NOT NULL,
  emp_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_users_user_id ON public.candidate_users(user_id);
CREATE INDEX idx_candidate_users_candidate_id ON public.candidate_users(candidate_id);
CREATE INDEX idx_candidate_users_emp_id ON public.candidate_users(emp_id);

ALTER TABLE public.candidate_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage candidate_users"
  ON public.candidate_users FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Candidates can view their own link"
  ON public.candidate_users FOR SELECT
  USING (auth.uid() = user_id);

-- 2) Helper functions
CREATE OR REPLACE FUNCTION public.is_candidate(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.candidate_users WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT candidate_id FROM public.candidate_users WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_emp_id(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT emp_id FROM public.candidate_users WHERE user_id = _user_id LIMIT 1
$$;

-- 3) candidates: candidates can view & update their own record (non-sensitive editing handled in app)
CREATE POLICY "Candidates can view their own record"
  ON public.candidates FOR SELECT
  USING (public.is_candidate(auth.uid()) AND id = public.get_candidate_id(auth.uid()));

CREATE POLICY "Candidates can update their own record"
  ON public.candidates FOR UPDATE
  USING (public.is_candidate(auth.uid()) AND id = public.get_candidate_id(auth.uid()))
  WITH CHECK (public.is_candidate(auth.uid()) AND id = public.get_candidate_id(auth.uid()));

-- 4) self_billed_invoices: candidates can view their own
CREATE POLICY "Candidates can read their own self_billed_invoices"
  ON public.self_billed_invoices FOR SELECT
  USING (public.is_candidate(auth.uid()) AND emp_id = public.get_candidate_emp_id(auth.uid()));

-- 5) time_logs: candidates can view their own
CREATE POLICY "Candidates can view their own time_logs"
  ON public.time_logs FOR SELECT
  USING (public.is_candidate(auth.uid()) AND candidate_id = public.get_candidate_id(auth.uid()));

-- 6) support_tickets: candidates can create/view/update their own tickets
CREATE POLICY "Candidates can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (public.is_candidate(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Candidates can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (public.is_candidate(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Candidates can update their own tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.is_candidate(auth.uid()) AND user_id = auth.uid());

-- 7) support_messages: candidates can chat on their own tickets
CREATE POLICY "Candidates can view messages on their tickets"
  ON public.support_messages FOR SELECT
  USING (
    public.is_candidate(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = support_messages.ticket_id AND st.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create messages on their tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    public.is_candidate(auth.uid())
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = support_messages.ticket_id AND st.user_id = auth.uid()
    )
  );
