import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error?: string | null;
}

export function FileUpload({ onFileSelect, isProcessing, error }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls') ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel'
        ) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="w-full relative">
      <div
        className={cn(
          'upload-zone',
          isDragActive && 'active',
          error && 'error'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {selectedFile ? (
            <>
              <div className="p-4 rounded-2xl bg-primary/10">
                <FileSpreadsheet className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    clearFile();
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-muted/80">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (.xlsx, .xls)
                </p>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center space-x-3 text-primary pt-2">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-5 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Upload Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
