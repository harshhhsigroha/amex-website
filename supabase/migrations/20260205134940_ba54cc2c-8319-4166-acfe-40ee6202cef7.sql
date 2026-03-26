-- Allow public (unauthenticated) users to insert candidates for the onboarding form
CREATE POLICY "Public can insert candidates for onboarding" 
ON public.candidates 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Add a comment to document this is for the public onboarding form
COMMENT ON POLICY "Public can insert candidates for onboarding" ON public.candidates IS 'Allows public candidate onboarding form submissions';