import { useState, useCallback, useMemo } from 'react';
import { MasterInvoice, TimesheetEntry } from '@/types/timesheet';
import { Candidate, SelfBillException, SelfBilledInvoice } from '@/types/candidate';
import { generateSelfBillPDF, SelfBillIssuer } from '@/lib/selfBillPdfGenerator';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { validateCandidatePaymentDetails } from '@/lib/candidateMasterParser';
import { getUKFinancialPeriod, validateFinancialDate } from '@/lib/ukFinancialYear';
import { getFinancialYearForDate, getFinancialWeekNumber, generateStoragePath } from '@/lib/ukFinancialCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddContractorDialog } from '@/components/AddContractorDialog';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Users,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SelfBillGeneratorProps {
  invoice: MasterInvoice;
  candidates: Candidate[];
  getCandidateByEmpId: (empId: string) => Candidate | undefined;
  getCandidateByName: (firstName: string, surname: string) => Candidate | undefined;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addInvoice: (invoice: Omit<SelfBilledInvoice, 'id' | 'created_at'>) => Promise<void>;
  getNextRemittanceNumber: () => Promise<string>;
  onComplete: () => void;
  issuer?: SelfBillIssuer;
  invoiceSettings?: Partial<InvoiceSettings>;
}

interface GenerationStatus {
  isGenerating: boolean;
  progress: number;
  total: number;
  successful: number;
  exceptions: SelfBillException[];
}

export function SelfBillGenerator({
  invoice,
  candidates,
  getCandidateByEmpId,
  getCandidateByName,
  addCandidate,
  addInvoice,
  getNextRemittanceNumber,
  onComplete,
  issuer,
  invoiceSettings,
}: SelfBillGeneratorProps) {
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    progress: 0,
    total: 0,
    successful: 0,
    exceptions: [],
  });

  const [addContractorDialog, setAddContractorDialog] = useState<{
    open: boolean;
    empId: string;
    candidateName?: string;
  }>({ open: false, empId: '' });

  // Group timesheet entries by EMP ID
  const entriesByEmpId = useMemo(() => {
    const map = new Map<string, TimesheetEntry[]>();
    invoice.entries.forEach(entry => {
      const existing = map.get(entry.empId) || [];
      existing.push(entry);
      map.set(entry.empId, existing);
    });
    return map;
  }, [invoice.entries]);

  // Pre-validate candidates
  const validation = useMemo(() => {
    const uniqueEmpIds = Array.from(entriesByEmpId.keys());
    const exceptions: SelfBillException[] = [];
    const validCandidates: { empId: string; candidate: Candidate; entries: TimesheetEntry[] }[] = [];

    uniqueEmpIds.forEach(empId => {
      const entries = entriesByEmpId.get(empId) || [];
      
      // Try to find candidate by emp_id first, then by name as fallback
      let candidate = getCandidateByEmpId(empId);
      if (!candidate && entries[0]) {
        candidate = getCandidateByName(entries[0].firstName, entries[0].surname);
      }

      if (!candidate) {
        exceptions.push({
          emp_id: empId,
          candidate_name: entries[0] ? `${entries[0].firstName} ${entries[0].surname}` : undefined,
          reason: 'Candidate not found in master file',
          type: 'missing_candidate',
        });
        return;
      }

      const paymentValidation = validateCandidatePaymentDetails(candidate);
      if (!paymentValidation.valid) {
        exceptions.push({
          emp_id: empId,
          candidate_name: candidate.candidate_name,
          reason: `Missing payment details: ${paymentValidation.missingFields.join(', ')}`,
          type: 'missing_payment_details',
        });
        return;
      }

      validCandidates.push({ empId, candidate, entries });
    });

    return { validCandidates, exceptions, total: uniqueEmpIds.length };
  }, [entriesByEmpId, getCandidateByEmpId]);

  const handleGenerate = useCallback(async () => {
    // Validate financial date
    const paymentDate = invoice.payDate;
    const dateValidation = validateFinancialDate(new Date(paymentDate));
    if (!dateValidation.valid) {
      toast.error('Cannot determine UK financial period', {
        description: dateValidation.error,
      });
      return;
    }

    if (validation.validCandidates.length === 0) {
      toast.error('No valid candidates to generate invoices for');
      return;
    }

    setStatus({
      isGenerating: true,
      progress: 0,
      total: validation.validCandidates.length,
      successful: 0,
      exceptions: [...validation.exceptions],
    });

    const financialPeriod = getUKFinancialPeriod(new Date(paymentDate));
    let successful = 0;
    const newExceptions: SelfBillException[] = [];

    for (let i = 0; i < validation.validCandidates.length; i++) {
      const { empId, candidate, entries } = validation.validCandidates[i];

      try {
        const remittanceNumber = await getNextRemittanceNumber();

        // Generate PDF with agency branding
        const result = generateSelfBillPDF(
          candidate,
          entries,
          remittanceNumber,
          paymentDate,
          0,
          issuer,
          invoiceSettings
        );

        // Save to database
        await addInvoice({
          emp_id: empId,
          candidate_snapshot: result.candidateSnapshot,
          remittance_number: remittanceNumber,
          payment_date: paymentDate,
          financial_year: financialPeriod.financialYear,
          financial_week: financialPeriod.financialWeek,
          net_total: result.netTotal,
          deductions: result.deductions,
          total_to_pay: result.totalToPay,
          line_items: result.lineItems,
          pdf_filename: result.filename,
        });

        // Upload PDF to Files system
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const fy = getFinancialYearForDate(result.paymentDate);
            const weekNumber = getFinancialWeekNumber(result.paymentDate);
            const storagePath = generateStoragePath(
              'self-bills',
              result.paymentDate,
              result.filename
            );

            // Upload to storage bucket
            const { error: uploadError } = await supabase.storage
              .from('files')
              .upload(storagePath, result.pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
              });

            if (!uploadError) {
              // Create file metadata record
              await supabase.from('files').insert({
                client_id: null, // Self-bills are not client-specific
                uploaded_by: currentUser.id,
                file_name: result.filename,
                file_path: storagePath,
                file_size: result.pdfBlob.size,
                mime_type: 'application/pdf',
                file_type: 'self-bill',
                financial_year: fy.label,
                financial_week: weekNumber,
                file_date: result.paymentDate.toISOString().split('T')[0],
                description: `Self-Billed Invoice ${remittanceNumber} for ${candidate.candidate_name}`,
              });
            }
          }
        } catch (fileError) {
          console.warn('Failed to save PDF to files system:', fileError);
          // Don't fail the whole operation if file save fails
        }

        successful++;
      } catch (err) {
        newExceptions.push({
          emp_id: empId,
          candidate_name: candidate.candidate_name,
          reason: err instanceof Error ? err.message : 'Generation failed',
          type: 'other',
        });
      }

      setStatus(prev => ({
        ...prev,
        progress: i + 1,
        successful,
        exceptions: [...validation.exceptions, ...newExceptions],
      }));

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setStatus(prev => ({ ...prev, isGenerating: false }));

    if (successful > 0) {
      toast.success(`Generated ${successful} self-billed invoices`, {
        description: `${validation.exceptions.length + newExceptions.length} exceptions logged`,
      });
    }

    if (successful === validation.validCandidates.length) {
      onComplete();
    }
  }, [invoice, validation, getNextRemittanceNumber, addInvoice, onComplete]);

  const allExceptions = [...validation.exceptions, ...status.exceptions.filter(
    e => !validation.exceptions.find(ve => ve.emp_id === e.emp_id)
  )];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Generate Self-Billed Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-lg font-bold">{validation.total}</p>
            <p className="text-xs text-muted-foreground">Contractors</p>
          </div>
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <p className="text-lg font-bold text-green-700">{validation.validCandidates.length}</p>
            <p className="text-xs text-green-600">Ready</p>
          </div>
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <p className="text-lg font-bold text-red-700">{validation.exceptions.length}</p>
            <p className="text-xs text-red-600">Exceptions</p>
          </div>
        </div>

        {/* Pre-generation exceptions */}
        {validation.exceptions.length > 0 && !status.isGenerating && status.successful === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm">Exception Report</AlertTitle>
            <AlertDescription className="text-xs">
              <ScrollArea className="h-32 mt-2">
                {validation.exceptions.map((exc, i) => (
                  <div key={i} className="mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mr-1 text-xs">
                        {exc.emp_id}
                      </Badge>
                      <span>{exc.candidate_name && `${exc.candidate_name}: `}{exc.reason}</span>
                    </div>
                    {exc.type === 'missing_candidate' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 h-6 text-xs"
                        onClick={() => setAddContractorDialog({
                          open: true,
                          empId: exc.emp_id,
                          candidateName: exc.candidate_name,
                        })}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {status.isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                Generating {status.progress}/{status.total}...
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(status.progress / status.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion */}
        {!status.isGenerating && status.successful > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-sm text-green-800">Generation Complete</AlertTitle>
            <AlertDescription className="text-xs text-green-700">
              {status.successful} self-billed invoices generated and saved.
              {allExceptions.length > 0 && ` ${allExceptions.length} exceptions.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Warning if no candidates loaded */}
        {candidates.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              No candidate master data loaded. Upload a Candidate Master file first.
            </AlertDescription>
          </Alert>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={
            status.isGenerating || 
            validation.validCandidates.length === 0 ||
            candidates.length === 0
          }
          className="w-full"
        >
          {status.isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Generate {validation.validCandidates.length} Self-Billed Invoices
            </>
          )}
        </Button>
      </CardContent>

      {/* Add Contractor Dialog */}
      <AddContractorDialog
        open={addContractorDialog.open}
        onOpenChange={(open) => setAddContractorDialog(prev => ({ ...prev, open }))}
        empId={addContractorDialog.empId}
        candidateName={addContractorDialog.candidateName}
        onSave={addCandidate}
      />
    </Card>
  );
}
