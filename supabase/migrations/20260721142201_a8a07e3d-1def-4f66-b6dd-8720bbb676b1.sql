DROP POLICY IF EXISTS "Authenticated users can read onboarding files" ON storage.objects;

CREATE POLICY "Admins can read onboarding files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'onboarding-uploads'
  AND public.is_admin(auth.uid())
);