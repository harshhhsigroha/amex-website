import ExcelJS from 'exceljs';
import { readSpreadsheetRows } from '@/lib/workbookReader';
import { TimesheetEntry, MasterInvoice, REQUIRED_COLUMNS } from '@/types/timesheet';

export interface ParseResult {
  success: boolean;
  data?: MasterInvoice;
  error?: string;
  missingColumns?: string[];
}

function parseDate(value: unknown): string {
  if (!value) return '';
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  if (typeof value === 'number') {
    // Excel date serial number - convert to Date
    const epoch = new Date(1899, 11, 30);
    const date = new Date(epoch.getTime() + value * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  // Handle string dates in DD/MM/YYYY format (UK format)
  if (typeof value === 'string') {
    const str = value.trim();
    const ukDateMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ukDateMatch) {
      const [, day, month, year] = ukDateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return str;
  }
  
  return String(value);
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[£$,]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    let jsonData: Record<string, unknown>[];
    try {
      jsonData = await readSpreadsheetRows(file);
    } catch (readErr) {
      return {
        success: false,
        error: readErr instanceof Error ? readErr.message : 'Failed to read the uploaded file.',
      };
    }

    if (jsonData.length === 0) {
      return { success: false, error: 'The uploaded file contains no data.' };
    }
    
    // Check for required columns
    const headers = Object.keys(jsonData[0]).map(h => h.toUpperCase().trim());
    const missingColumns = REQUIRED_COLUMNS.filter(
      col => !headers.includes(col.toUpperCase())
    );
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        missingColumns,
      };
    }
    
    // Map data to TimesheetEntry
    const entries: TimesheetEntry[] = jsonData.map((row) => {
      const getColumn = (colName: string): unknown => {
        const key = Object.keys(row).find(
          k => k.toUpperCase().trim() === colName.toUpperCase()
        );
        return key ? row[key] : '';
      };
      
      return {
        empId: String(getColumn('EMP ID') || ''),
        firstName: String(getColumn('FIRSTNAME') || ''),
        surname: String(getColumn('SURNAME') || ''),
        timesheetId: String(getColumn('TIMESHEET ID') || ''),
        hours: parseNumber(getColumn('HOURS')),
        payRate: parseNumber(getColumn('PAY RATE')),
        payAmount: parseNumber(getColumn('PAY AMOUNT')),
        vat: parseNumber(getColumn('VAT')),
        total: parseNumber(getColumn('TOTAL')),
        umbrellaCompany: String(getColumn('UMBRELLA COMPANY') || ''),
        startDate: parseDate(getColumn('START DATE')),
        endDate: parseDate(getColumn('END DATE')),
        payDate: parseDate(getColumn('PAY DATE')),
      };
    });
    
    // Calculate summary
    const uniqueEmpIds = new Set(entries.map(e => e.empId));
    const startDates = entries.map(e => e.startDate).filter(Boolean).sort();
    const endDates = entries.map(e => e.endDate).filter(Boolean).sort();
    const payDates = entries.map(e => e.payDate).filter(Boolean).sort();
    
    const masterInvoice: MasterInvoice = {
      invoiceType: 'Master Invoice',
      umbrellaCompany: entries[0]?.umbrellaCompany || '',
      periodStart: startDates[0] || '',
      periodEnd: endDates[endDates.length - 1] || '',
      payDate: payDates[payDates.length - 1] || '',
      totalContractors: uniqueEmpIds.size,
      entries,
      totalGrossPay: entries.reduce((sum, e) => sum + e.payAmount, 0),
      totalVat: entries.reduce((sum, e) => sum + e.vat, 0),
      grandTotal: entries.reduce((sum, e) => sum + e.total, 0),
    };
    
    return { success: true, data: masterInvoice };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function exportToExcel(invoice: MasterInvoice): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Master Invoice');
  
  // Header section
  worksheet.addRow(['MASTER INVOICE']);
  worksheet.addRow([]);
  worksheet.addRow(['Invoice Type:', invoice.invoiceType]);
  worksheet.addRow(['Umbrella Company:', invoice.umbrellaCompany]);
  worksheet.addRow(['Period Start:', invoice.periodStart]);
  worksheet.addRow(['Period End:', invoice.periodEnd]);
  worksheet.addRow(['Pay Date:', invoice.payDate]);
  worksheet.addRow(['Total Contractors:', invoice.totalContractors]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  
  // Table headers
  const tableHeaders = [
    'EMP ID', 'Contractor Full Name', 'TIMESHEET ID', 'HOURS',
    'PAY RATE', 'PAY AMOUNT (Gross)', 'VAT', 'TOTAL (Gross + VAT)',
  ];
  worksheet.addRow(tableHeaders);
  
  // Table data
  invoice.entries.forEach((entry) => {
    worksheet.addRow([
      entry.empId, `${entry.firstName} ${entry.surname}`,
      entry.timesheetId, entry.hours, entry.payRate,
      entry.payAmount, entry.vat, entry.total,
    ]);
  });
  
  // Totals
  worksheet.addRow([]);
  worksheet.addRow(['', '', '', '', '', 'Total Gross Pay:', invoice.totalGrossPay, '']);
  worksheet.addRow(['', '', '', '', '', 'Total VAT:', invoice.totalVat, '']);
  worksheet.addRow(['', '', '', '', '', 'Grand Total:', '', invoice.grandTotal]);
  
  // Column widths
  worksheet.columns = [
    { width: 12 }, { width: 25 }, { width: 15 }, { width: 10 },
    { width: 12 }, { width: 18 }, { width: 12 }, { width: 18 },
  ];
  
  // Apply Times New Roman font
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = { name: 'Times New Roman', size: 11 };
    });
  });
  
  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MASTER_INVOICE.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
