import { FileUpload } from '@/components/FileUpload';
import { FileText } from 'lucide-react';

const REQUIRED_COLUMNS = [
  'EMP ID', 'FIRSTNAME', 'SURNAME', 'TIMESHEET ID', 'HOURS', 
  'PAY RATE', 'PAY AMOUNT', 'VAT', 'TOTAL', 'UMBRELLA COMPANY', 
  'START DATE', 'END DATE', 'PAY DATE'
];

interface TimesheetUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  title?: string;
  description?: string;
}

export function TimesheetUpload({ 
  onFileSelect, 
  isProcessing, 
  error,
  title = 'Upload Timesheet',
  description = 'Upload an Excel file to generate a Master Invoice'
}: TimesheetUploadProps) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <FileUpload
        onFileSelect={onFileSelect}
        isProcessing={isProcessing}
        error={error}
      />

      <div className="mt-10 p-6 rounded-xl bg-muted/30 border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-4">Required Columns</h3>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLUMNS.map((col) => (
            <span 
              key={col} 
              className="text-xs px-3 py-1.5 rounded-lg bg-card border border-border/50 text-muted-foreground font-mono"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
