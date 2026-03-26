import { DbInvoice } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Calendar, FileText, Download, Hash, Users, PoundSterling, Percent, Receipt } from 'lucide-react';
import { formatFinancialWeek } from '@/lib/ukFinancialYear';
import { regenerateInvoicePDF } from '@/lib/pdfGenerator';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoiceDetailDialogProps {
  invoice: DbInvoice | null;
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
    month: 'short',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export function InvoiceDetailDialog({ invoice, open, onOpenChange }: InvoiceDetailDialogProps) {
  const { effectiveSettings } = useInvoiceSettings();
  if (!invoice) return null;

  const clientSnapshot = invoice.client_snapshot;

  const handleDownloadPDF = () => {
    regenerateInvoicePDF(invoice, effectiveSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Invoice {invoice.invoice_number}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Generated on {formatDateLong(invoice.invoice_date)}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {invoice.financial_year} / {formatFinancialWeek(invoice.financial_week)}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-xl p-4 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mb-1">
                <PoundSterling className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold">{formatCurrency(invoice.total_gross)}</p>
              <p className="text-xs text-muted-foreground">Gross</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 mb-1">
                <Percent className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-lg font-bold">{formatCurrency(invoice.total_vat)}</p>
              <p className="text-xs text-muted-foreground">VAT</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 mb-1">
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-primary">{formatCurrency(invoice.grand_total)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Card */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building className="h-4 w-4 text-primary" />
                Billed To
              </div>
              <div className="space-y-1">
                <p className="font-medium">{clientSnapshot.company_name}</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{clientSnapshot.address_line_1}</p>
                  {clientSnapshot.address_line_2 && <p>{clientSnapshot.address_line_2}</p>}
                  <p>{clientSnapshot.city}, {clientSnapshot.postcode}</p>
                  <p>{clientSnapshot.country}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details Card */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Hash className="h-4 w-4 text-primary" />
                Details
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Invoice Number</span>
                  <span className="font-mono text-sm font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contractors</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {invoice.total_contractors}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PDF File</span>
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]" title={invoice.pdf_filename}>
                    {invoice.pdf_filename}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Period Card */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              Invoice Period
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-medium">{formatDate(invoice.period_start)}</p>
              </div>
              <div className="w-12 h-px bg-border flex-shrink-0" />
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-medium">{formatDate(invoice.period_end)}</p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button onClick={handleDownloadPDF} className="w-full gap-2" size="lg">
            <Download className="h-4 w-4" />
            Download Invoice PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}