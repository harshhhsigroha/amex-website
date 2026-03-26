
-- Create a public storage bucket for candidate onboarding uploads (signatures, file uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-uploads', 'onboarding-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to the onboarding-uploads bucket
CREATE POLICY "Anyone can upload onboarding files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'onboarding-uploads');

-- Allow anyone to read onboarding files (public bucket)
CREATE POLICY "Anyone can read onboarding files"
ON storage.objects FOR SELECT
USING (bucket_id = 'onboarding-uploads');
