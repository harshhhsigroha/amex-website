import { useState } from 'react';
import { DbInvoice } from '@/types/database';
import { InvoiceFilters } from '@/hooks/useInvoices';
import { DbClient } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, Filter, X } from 'lucide-react';
import { formatFinancialWeek } from '@/lib/ukFinancialYear';
import { InvoiceDetailDialog } from '@/components/InvoiceDetailDialog';

interface InvoiceHistoryProps {
  invoices: DbInvoice[];
  clients: DbClient[];
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  financialYears: string[];
  financialWeeks: number[];
  isLoading: boolean;
}

export const InvoiceHistory = ({
  invoices,
  clients,
  filters,
  onFiltersChange,
  financialYears,
  financialWeeks,
  isLoading,
}: InvoiceHistoryProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<DbInvoice | null>(null);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Invoice History
          </CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
          <div>
            <Label className="text-xs flex items-center gap-1 mb-1">
              <Filter className="h-3 w-3" />
              Financial Year
            </Label>
            <Select
              value={filters.financialYear || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, financialYear: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="h-8 bg-background">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Years</SelectItem>
                {financialYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Financial Week</Label>
            <Select
              value={filters.financialWeek?.toString() || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, financialWeek: v === 'all' ? undefined : parseInt(v) })}
            >
              <SelectTrigger className="h-8 bg-background">
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Weeks</SelectItem>
                {financialWeeks.map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    {formatFinancialWeek(week)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Client</Label>
            <Select
              value={filters.clientId || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, clientId: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="h-8 bg-background">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Invoice Date</Label>
            <Input
              type="date"
              className="h-8"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Invoice #</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">FY / Week</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client_snapshot.company_name}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                        {invoice.financial_year} / {formatFinancialWeek(invoice.financial_week)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.grand_total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {invoices.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found • Click to view details
          </p>
        )}

        <InvoiceDetailDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
        />
      </CardContent>
    </Card>
  );
};
