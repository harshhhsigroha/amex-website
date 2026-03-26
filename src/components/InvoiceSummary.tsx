import { MasterInvoice } from '@/types/timesheet';
import { FileText, Building, Calendar, Users } from 'lucide-react';

interface InvoiceSummaryProps {
  invoice: MasterInvoice;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Invoice Type</p>
            <p className="text-base font-semibold text-foreground mt-0.5">{invoice.invoiceType}</p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Umbrella Company</p>
            <p className="text-base font-semibold text-foreground truncate max-w-[150px] mt-0.5" title={invoice.umbrellaCompany}>
              {invoice.umbrellaCompany || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Period</p>
            <p className="text-base font-semibold text-foreground mt-0.5">
              {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
            </p>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Contractors</p>
            <p className="text-base font-semibold text-foreground mt-0.5">{invoice.totalContractors}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
