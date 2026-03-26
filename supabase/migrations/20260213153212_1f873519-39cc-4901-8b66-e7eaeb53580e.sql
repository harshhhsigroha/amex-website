-- Remove the overly permissive public INSERT policy on candidates
DROP POLICY IF EXISTS "Public can insert candidates for onboarding" ON public.candidates;
