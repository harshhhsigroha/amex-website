import { useState } from 'react';
import { SelfBilledInvoice } from '@/types/candidate';
import { SelfBillFilters } from '@/hooks/useSelfBilledInvoices';
import { formatFinancialWeek } from '@/lib/ukFinancialYear';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search } from 'lucide-react';
import { SelfBillDetailDialog } from '@/components/SelfBillDetailDialog';

interface SelfBillHistoryProps {
  invoices: SelfBilledInvoice[];
  filters: SelfBillFilters;
  onFiltersChange: (filters: SelfBillFilters) => void;
  financialYears: string[];
  financialWeeks: number[];
  isLoading: boolean;
}

const formatCurrency = (value: number): string => {
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function SelfBillHistory({
  invoices,
  filters,
  onFiltersChange,
  financialYears,
  financialWeeks,
  isLoading,
}: SelfBillHistoryProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<SelfBilledInvoice | null>(null);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Self-Billed Invoice History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Financial Year</Label>
            <Select
              value={filters.financialYear || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  financialYear: value === 'all' ? '' : value,
                  financialWeek: null,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {financialYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Financial Week</Label>
            <Select
              value={filters.financialWeek?.toString() || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  financialWeek: value === 'all' ? null : parseInt(value, 10),
                })
              }
              disabled={!filters.financialYear}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {financialWeeks.map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    {formatFinancialWeek(week)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Search EMP ID</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.empId}
                onChange={(e) =>
                  onFiltersChange({ ...filters, empId: e.target.value })
                }
                className="h-9 pl-8"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Remittance #</TableHead>
                <TableHead className="text-xs">EMP ID</TableHead>
                <TableHead className="text-xs">Candidate</TableHead>
                <TableHead className="text-xs">Payment Date</TableHead>
                <TableHead className="text-xs">Period</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No self-billed invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell className="font-mono text-xs">
                      {invoice.remittance_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {invoice.emp_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {invoice.candidate_snapshot.candidate_name}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(invoice.payment_date)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="text-muted-foreground">
                        {invoice.financial_year} • {formatFinancialWeek(invoice.financial_week)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {formatCurrency(invoice.total_to_pay)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Summary */}
        {!isLoading && invoices.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} • Click to view details
            </span>
            <span className="text-sm font-semibold">
              Total: {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total_to_pay, 0))}
            </span>
          </div>
        )}

        <SelfBillDetailDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
        />
      </CardContent>
    </Card>
  );
}
