
-- 1. Add client_id to candidates table
ALTER TABLE public.candidates ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- 2. Drop old overly-permissive client RLS policies on candidates
DROP POLICY IF EXISTS "Clients can read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Clients can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Clients can update candidates" ON public.candidates;

-- 3. Create new scoped client RLS policies
CREATE POLICY "Clients can read their own candidates"
ON public.candidates FOR SELECT
TO public
USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

CREATE POLICY "Clients can read sub-client candidates"
ON public.candidates FOR SELECT
TO public
USING (is_client(auth.uid()) AND client_id IN (
  SELECT id FROM public.clients WHERE parent_client_id = get_client_id(auth.uid())
));

CREATE POLICY "Clients can insert their own candidates"
ON public.candidates FOR INSERT
TO public
WITH CHECK (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

CREATE POLICY "Clients can update their own candidates"
ON public.candidates FOR UPDATE
TO public
USING (is_client(auth.uid()) AND client_id = get_client_id(auth.uid()));

-- 4. Secure onboarding-uploads bucket: make it private
UPDATE storage.buckets SET public = false WHERE id = 'onboarding-uploads';

-- 5. Drop old permissive storage policies
DROP POLICY IF EXISTS "Anyone can read onboarding files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload onboarding files" ON storage.objects;

-- 6. Create authenticated storage policies
CREATE POLICY "Authenticated users can upload onboarding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'onboarding-uploads');

CREATE POLICY "Authenticated users can read onboarding files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'onboarding-uploads');

-- 7. Allow public uploads for candidate onboarding (anonymous form submissions)
CREATE POLICY "Public can upload to onboarding-uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'onboarding-uploads');
