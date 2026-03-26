import { MasterInvoice } from '@/types/timesheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimesheetTableProps {
  invoice: MasterInvoice;
}

export function TimesheetTable({ invoice }: TimesheetTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Timesheet Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">EMP ID</TableHead>
                <TableHead className="font-semibold text-foreground">Contractor Full Name</TableHead>
                <TableHead className="font-semibold text-foreground">Timesheet ID</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Hours</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Pay Rate</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Pay Amount (Gross)</TableHead>
                <TableHead className="font-semibold text-foreground text-right">VAT</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Total (Gross + VAT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.entries.map((entry, index) => (
                <TableRow 
                  key={`${entry.empId}-${entry.timesheetId}-${index}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{entry.empId}</TableCell>
                  <TableCell className="text-foreground">{`${entry.firstName} ${entry.surname}`}</TableCell>
                  <TableCell className="text-foreground">{entry.timesheetId}</TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatNumber(entry.hours)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatCurrency(entry.payRate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatCurrency(entry.payAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatCurrency(entry.vat)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-foreground">
                    {formatCurrency(entry.total)}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Section */}
              <TableRow className="bg-muted/30 border-t-2 border-border">
                <TableCell colSpan={5} className="text-right font-semibold text-foreground">
                  Total Gross Pay:
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold text-foreground">
                  {formatCurrency(invoice.totalGrossPay)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="text-right font-semibold text-foreground">
                  Total VAT:
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right tabular-nums font-bold text-foreground">
                  {formatCurrency(invoice.totalVat)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                <TableCell colSpan={5} className="text-right font-bold text-primary">
                  Grand Total:
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right tabular-nums font-bold text-primary text-lg">
                  {formatCurrency(invoice.grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
