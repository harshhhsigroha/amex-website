import { useCallback, useState } from 'react';
import { Upload, FileCheck, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingFileUploadProps {
  label: string;
  required?: boolean;
  description?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  value?: string; // uploaded file URL
  onChange: (url: string) => void;
}

export function OnboardingFileUpload({
  label,
  required,
  description,
  acceptedFileTypes = '.pdf,.jpg,.png',
  maxFileSize = 5,
  value,
  onChange,
}: OnboardingFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size must be under ${maxFileSize}MB`);
      return;
    }

    // Validate file type
    if (acceptedFileTypes) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const allowed = acceptedFileTypes.split(',').map(t => t.trim().toLowerCase());
      if (!allowed.some(a => ext === a || file.type.includes(a.replace('.', '')))) {
        setError(`Accepted file types: ${acceptedFileTypes}`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('onboarding-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('onboarding-uploads')
        .getPublicUrl(filePath);

      setFileName(file.name);
      onChange(publicUrl);
      toast.success('File uploaded');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  }, [acceptedFileTypes, maxFileSize, onChange]);

  const clearFile = () => {
    setFileName(null);
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {value && fileName ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <FileCheck className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="text-sm flex-1 truncate">{fileName}</span>
          <Button type="button" variant="ghost" size="sm" onClick={clearFile} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-primary">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
              <span className="text-xs text-muted-foreground/70 mt-1">
                {acceptedFileTypes} • Max {maxFileSize}MB
              </span>
            </>
          )}
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
