import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { DbClient } from '@/types/database';

interface InvoiceGeneratorProps {
  selectedClient: DbClient | null;
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  onExport: () => void;
  onGeneratePDF: () => void;
  isGeneratingPDF: boolean;
}

export function InvoiceGenerator({
  selectedClient,
  invoiceNumber,
  onInvoiceNumberChange,
  onExport,
  onGeneratePDF,
  isGeneratingPDF,
}: InvoiceGeneratorProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          Generate Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="invoiceNumber" className="text-xs text-muted-foreground">
            Invoice Number
          </Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="INV-20240101-001"
            className="h-9"
          />
        </div>

        {!selectedClient && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Select a client first
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            onClick={onGeneratePDF}
            disabled={!selectedClient || !invoiceNumber.trim() || isGeneratingPDF}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
