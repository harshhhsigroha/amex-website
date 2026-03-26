import { useState, useCallback } from 'react';
import { parseCandidateMasterFile } from '@/lib/candidateMasterParser';
import { Candidate } from '@/types/candidate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Users, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CandidateMasterUploadProps {
  onUpload: (candidates: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>[]) => Promise<{ inserted: number; updated: number; errors: string[] }>;
  candidateCount: number;
  isLoading: boolean;
}

export function CandidateMasterUpload({ onUpload, candidateCount, isLoading }: CandidateMasterUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number; errors: string[]; warnings?: string[] } | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const parseResult = await parseCandidateMasterFile(file);

      if (!parseResult.success || !parseResult.data) {
        toast.error('Failed to parse file', { description: parseResult.error });
        setIsProcessing(false);
        return;
      }

      const uploadResult = await onUpload(parseResult.data);
      
      setResult({
        ...uploadResult,
        warnings: parseResult.warnings,
      });

      if (uploadResult.errors.length === 0) {
        toast.success('Candidate Master uploaded', {
          description: `${uploadResult.inserted} added, ${uploadResult.updated} updated`,
        });
      } else {
        toast.warning('Upload completed with errors', {
          description: `${uploadResult.errors.length} candidates failed`,
        });
      }
    } catch (err) {
      toast.error('Upload failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      e.target.value = '';
    }
  }, [onUpload]);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Candidate Master File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 border-2 border-dashed border-border rounded-lg">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="candidate-master-upload"
            disabled={isProcessing || isLoading}
          />
          <label htmlFor="candidate-master-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {isProcessing ? 'Processing...' : 'Upload Candidate Master Excel'}
              </span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Candidates loaded:</span>
          <span className="font-semibold">{isLoading ? '...' : candidateCount}</span>
        </div>

        {result && (
          <div className="space-y-2">
            {(result.inserted > 0 || result.updated > 0) && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs">
                  {result.inserted > 0 && `${result.inserted} new candidates added. `}
                  {result.updated > 0 && `${result.updated} candidates updated.`}
                </AlertDescription>
              </Alert>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-xs">
                  {result.warnings.length} warnings during parsing
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {result.errors.length} candidates failed to save
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Required column:</p>
          <p>CANDIDATE NAME (or Name)</p>
          <p className="mt-1 font-semibold">Payment columns (for invoice generation):</p>
          <p>Beneficiary Name, Account Number, Sort Code</p>
          <p className="mt-1 text-muted-foreground/70">Optional: Address, Agency, NI Number, Email, etc.</p>
        </div>
      </CardContent>
    </Card>
  );
}
