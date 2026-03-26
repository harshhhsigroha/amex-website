-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Create files metadata table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  file_type TEXT, -- 'invoice', 'self_bill', 'report', 'document'
  financial_year TEXT NOT NULL, -- e.g., 'FY 2024-2025'
  financial_week INTEGER NOT NULL, -- 1-53
  file_date DATE NOT NULL, -- The date the file belongs to
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_files_client_id ON public.files(client_id);
CREATE INDEX idx_files_financial_year ON public.files(financial_year);
CREATE INDEX idx_files_financial_week ON public.files(financial_week);
CREATE INDEX idx_files_file_date ON public.files(file_date);
CREATE INDEX idx_files_uploaded_by ON public.files(uploaded_by);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Admins can see all files
CREATE POLICY "Admins can view all files"
ON public.files FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can insert files
CREATE POLICY "Admins can insert files"
ON public.files FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update files
CREATE POLICY "Admins can update files"
ON public.files FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admins can delete files
CREATE POLICY "Admins can delete files"
ON public.files FOR DELETE
USING (public.is_admin(auth.uid()));

-- Clients can view their own files
CREATE POLICY "Clients can view their own files"
ON public.files FOR SELECT
USING (
  public.is_client(auth.uid()) AND 
  client_id = public.get_client_id(auth.uid())
);

-- Storage policies for the files bucket

-- Admins can read all files in storage
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
USING (bucket_id = 'files' AND public.is_admin(auth.uid()));

-- Admins can upload files
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'files' AND public.is_admin(auth.uid()));

-- Admins can update files
CREATE POLICY "Admins can update files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'files' AND public.is_admin(auth.uid()));

-- Admins can delete files
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'files' AND public.is_admin(auth.uid()));

-- Clients can read their own files in storage (files are stored in client-specific folders)
CREATE POLICY "Clients can read their own files in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'files' AND 
  public.is_client(auth.uid()) AND
  (storage.foldername(name))[1] = public.get_client_id(auth.uid())::text
);

-- Add trigger for updated_at
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();