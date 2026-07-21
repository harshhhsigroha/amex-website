import { useState, useEffect } from 'react';
import { Candidate } from '@/types/candidate';
import { supabase } from '@/integrations/supabase/client';
import { FormField, DEFAULT_FIELDS } from '@/components/OnboardingFormBuilder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  CreditCard,
  FileCheck,
  Building2,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  KeyRound,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { CreateCandidateLoginDialog } from './CreateCandidateLoginDialog';

interface CandidateDetailDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_TO_DB_MAP: Record<string, string> = {
  candidate_name: 'candidate_name',
  email: 'email',
  contact_no: 'contact_no',
  address: 'address',
  dob: 'dob',
  gender: 'gender',
  ni_number: 'ni_number',
  bank_name: 'bank_name',
  sort_code: 'sort_code',
  account_number: 'account_number',
  beneficiary_name: 'beneficiary_name',
  has_candidate_id: 'has_candidate_id',
  right_to_work: 'right_to_work',
  proof_of_address: 'proof_of_address',
};

const sectionIcons: Record<string, React.ElementType> = {
  personal: User,
  bank: CreditCard,
  documents: FileCheck,
  custom: Building2,
};

const sectionLabels: Record<string, string> = {
  personal: 'Personal Information',
  bank: 'Bank Details',
  documents: 'Documents',
  custom: 'Additional Information',
};

export function CandidateDetailDialog({ candidate, open, onOpenChange }: CandidateDetailDialogProps) {
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (open) {
      loadFormConfig();
    }
  }, [open]);

  const loadFormConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_form_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const fields = (data.fields as unknown as FormField[]) || DEFAULT_FIELDS;
        setFormFields(fields.filter(f => f.enabled));
      } else {
        setFormFields(DEFAULT_FIELDS.filter(f => f.enabled));
      }
    } catch {
      setFormFields(DEFAULT_FIELDS.filter(f => f.enabled));
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const getCandidateValue = (field: FormField): string | boolean | null => {
    if (!candidate) return null;
    const dbCol = FIELD_TO_DB_MAP[field.name];
    if (dbCol) {
      return (candidate as unknown as Record<string, unknown>)[dbCol] as string | boolean | null;
    }
    return null;
  };

  const formatValue = (field: FormField, value: string | boolean | null): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
    if (field.type === 'signature' && typeof value === 'string' && value.startsWith('data:')) return '✓ Signed';
    if (field.type === 'file_upload' && typeof value === 'string' && value.startsWith('http')) return '✓ Uploaded';
    return String(value);
  };

  const sections = ['personal', 'bank', 'documents', 'custom'] as const;
  const activeSections = sections.filter(s => formFields.some(f => f.section === s));

  const generatePdf = async () => {
    if (!candidate) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Candidate Registration Form', pageWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(`EMP ID: ${candidate.emp_id}`, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, y, { align: 'center' });
      doc.setTextColor(0);
      y += 12;

      // Draw a line
      doc.setDrawColor(200);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;

      for (const section of activeSections) {
        const sectionFields = formFields.filter(f => f.section === section);
        if (sectionFields.length === 0) continue;

        // Check if we need a new page
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        // Section header
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 100, 200);
        doc.text(sectionLabels[section], 20, y);
        doc.setTextColor(0);
        y += 8;

        for (const field of sectionFields) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }

          const value = getCandidateValue(field);
          const displayValue = formatValue(field, value);

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100);
          doc.text(field.label, 20, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0);
          doc.setFontSize(10);

          // Handle long values
          const maxWidth = pageWidth - 50;
          const lines = doc.splitTextToSize(displayValue, maxWidth);
          doc.text(lines, 20, y + 5);
          y += 5 + (lines.length * 5) + 4;
        }

        y += 6;
      }

      doc.save(`${candidate.candidate_name.replace(/\s+/g, '_')}_registration.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{candidate.candidate_name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                EMP ID: <span className="font-mono">{candidate.emp_id}</span> • Registered: {new Date(candidate.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginDialog(true)}
                className="gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Candidate Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePdf}
                disabled={isGeneratingPdf}
                className="gap-2"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoadingConfig ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {activeSections.map(section => {
                const sectionFields = formFields.filter(f => f.section === section);
                if (sectionFields.length === 0) return null;
                const Icon = sectionIcons[section];

                return (
                  <div key={section}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {sectionLabels[section]}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sectionFields.map(field => {
                        const value = getCandidateValue(field);
                        const displayValue = formatValue(field, value);
                        const hasValue = value !== null && value !== undefined && value !== '' && value !== false;

                        return (
                          <div key={field.id} className="rounded-lg border border-border p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                              {field.required && (
                                hasValue ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )
                              )}
                            </div>
                            <p className={`text-sm font-medium ${!hasValue ? 'text-muted-foreground italic' : ''}`}>
                              {displayValue}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>

      <CreateCandidateLoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        candidateId={candidate.id}
        candidateName={candidate.candidate_name}
        candidateEmail={candidate.email}
      />
    </Dialog>
  );
}
