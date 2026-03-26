import { SelfBilledInvoice, SelfBillLineItem } from '@/types/candidate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User, Calendar, CreditCard, Banknote, FileText, Download, Clock } from 'lucide-react';
import { formatFinancialWeek } from '@/lib/ukFinancialYear';
import { regenerateSelfBillPDF } from '@/lib/selfBillPdfGenerator';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';

interface SelfBillDetailDialogProps {
  invoice: SelfBilledInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatShortDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function SelfBillDetailDialog({ invoice, open, onOpenChange }: SelfBillDetailDialogProps) {
  const candidate = invoice?.candidate_snapshot;
  const lineItems = (invoice?.line_items as SelfBillLineItem[]) ?? [];
  const { effectiveSettings } = useInvoiceSettings();

  const handleDownloadPDF = () => {
    if (invoice) {
      regenerateSelfBillPDF(invoice, effectiveSettings);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {invoice && candidate && (
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Self-Billed Invoice Details
            </DialogTitle>
            <Button onClick={handleDownloadPDF} size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remittance Number</span>
              <span className="font-mono font-semibold">{invoice.remittance_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">EMP ID</span>
              <Badge variant="outline">{invoice.emp_id}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Date</span>
              <span>{formatDate(invoice.payment_date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Financial Period</span>
              <Badge variant="secondary">
                {invoice.financial_year} / {formatFinancialWeek(invoice.financial_week)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contractor Details */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              Contractor Details
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-lg">{candidate.candidate_name}</div>
              {candidate.address && (
                <p className="text-sm text-muted-foreground">{candidate.address}</p>
              )}
              {candidate.agency && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agency</span>
                  <span>{candidate.agency}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              Line Items ({lineItems.length})
            </h4>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Start Date</TableHead>
                    <TableHead className="text-xs">End Date</TableHead>
                    <TableHead className="text-xs text-right">Hours</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{formatShortDate(item.start_date)}</TableCell>
                      <TableCell className="text-xs">{formatShortDate(item.end_date)}</TableCell>
                      <TableCell className="text-xs text-right">{item.hours}</TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{formatCurrency(item.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Banknote className="h-4 w-4 text-primary" />
              Bank Details
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Beneficiary</span>
                <span className="font-medium">{candidate.beneficiary_name}</span>
              </div>
              {candidate.bank_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{candidate.bank_name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sort Code</span>
                <span className="font-mono">{candidate.sort_code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-mono">{candidate.account_number}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Summary
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Net Total</span>
                <span className="font-medium">{formatCurrency(invoice.net_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Deductions</span>
                <span className="font-medium text-destructive">-{formatCurrency(invoice.deductions)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total to Pay</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(invoice.total_to_pay)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      )}
    </Dialog>
  );
}