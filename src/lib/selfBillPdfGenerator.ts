import { jsPDF } from 'jspdf';
import { Candidate, SelfBillLineItem, CandidateSnapshot } from '@/types/candidate';
import { TimesheetEntry } from '@/types/timesheet';
import { DEFAULT_BRANDING } from '@/types/invoice';
import { getUKFinancialPeriod, formatFinancialWeek } from '@/lib/ukFinancialYear';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';

const formatCurrency = (value: number): string => {
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateStr = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export interface SelfBillPdfResult {
  filename: string;
  candidateSnapshot: CandidateSnapshot;
  lineItems: SelfBillLineItem[];
  netTotal: number;
  deductions: number;
  totalToPay: number;
  pdfBlob: Blob;
  paymentDate: Date;
}

// Generate filename per naming convention: SelfBill_CandidateName_FYXXXX-WXX.pdf
export function generateSelfBillFilename(
  candidateName: string,
  invoiceDate: Date
): string {
  const { financialYear, financialWeek } = getUKFinancialPeriod(invoiceDate);
  const cleanName = candidateName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  const fyCode = financialYear.replace('FY ', 'FY').replace('-', '-');
  const weekCode = formatFinancialWeek(financialWeek);
  return `SelfBill_${cleanName}_${fyCode}-${weekCode}.pdf`;
}

export interface SelfBillIssuer {
  companyName: string;
  primaryColor?: [number, number, number];
}

export function generateSelfBillPDF(
  candidate: Candidate,
  timesheetEntries: TimesheetEntry[],
  remittanceNumber: string,
  paymentDate: string,
  deductions: number = 0,
  issuer?: SelfBillIssuer,
  invoiceSettings?: Partial<InvoiceSettings>
): SelfBillPdfResult {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const issuerName = issuer?.companyName || DEFAULT_BRANDING.companyName;
  const primaryColor: [number, number, number] = issuer?.primaryColor || DEFAULT_BRANDING.primaryColor;
  const blackColor: [number, number, number] = [0, 0, 0];
  const whiteColor: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [245, 245, 245];
  const formatDate = formatDateStr;

  // Resolve "Invoice To" address - prefer live settings, fall back to defaults
  const invoiceTo = {
    companyName: invoiceSettings?.self_bill_company_name ?? 'AMEX Outsourcing',
    addressLine1: invoiceSettings?.self_bill_address_line1 ?? '545 Northumberland Avenue',
    addressLine2: invoiceSettings?.self_bill_address_line2 ?? 'Reading, England',
    city: invoiceSettings?.self_bill_city ?? '',
    postcode: invoiceSettings?.self_bill_postcode ?? 'RG2 8NU',
  };

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 36, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text(issuerName, margin, 14);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.text('Self Bill / Remittance Advice', margin, 22);
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.text('SELF BILL', pageWidth - margin, 20, { align: 'right' });

  y = 48;

  // Self Billing Invoice To
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text('Self Billing Invoice To:', margin, y);
  doc.setTextColor(...blackColor);
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  y += 6;
  doc.text(invoiceTo.companyName, margin, y);
  y += 5;
  doc.text(invoiceTo.addressLine1, margin, y);
  y += 5;
  doc.text(invoiceTo.addressLine2, margin, y);
  y += 5;
  doc.text(invoiceTo.city, margin, y);
  y += 5;
  doc.text(invoiceTo.postcode, margin, y);

  // Right side
  const rightX = pageWidth - margin - 60;
  let rightY = 42;
  doc.setFont('times', 'bold');
  doc.text('Remittance Number:', rightX, rightY);
  doc.setFont('times', 'normal');
  doc.text(remittanceNumber, rightX + 40, rightY);
  rightY += 6;
  doc.setFont('times', 'bold');
  doc.text('Payment Date:', rightX, rightY);
  doc.setFont('times', 'normal');
  doc.text(formatDate(paymentDate), rightX + 40, rightY);

  // Candidate
  y += 15;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text('Candidate:', margin, y);
  doc.setTextColor(...blackColor);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  y += 6;
  doc.text(candidate.candidate_name, margin, y);
  doc.setFont('times', 'normal');
  y += 5;
  const addressText = candidate.address || 'Address not provided';
  const addressLines = addressText.match(/.{1,60}(\s|$)/g) || [addressText];
  addressLines.forEach(line => { doc.text(line.trim(), margin, y); y += 5; });

  y += 10;

  // Table header
  doc.setFillColor(...lightGray);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  doc.line(margin, y + 10, margin + contentWidth, y + 10);
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(...blackColor);
  const colX = [margin + 5, margin + 35, margin + 65, margin + 100, margin + 135];
  doc.text('Start Date', colX[0], y + 7);
  doc.text('End Date', colX[1], y + 7);
  doc.text('Hours', colX[2], y + 7);
  doc.text('Rate', colX[3], y + 7);
  doc.text('Line Total', colX[4], y + 7);
  y += 10;

  // Line items
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  const lineItems: SelfBillLineItem[] = [];
  let netTotal = 0;

  timesheetEntries.forEach((entry) => {
    y += 7;
    const lineTotal = entry.payAmount;
    netTotal += lineTotal;
    lineItems.push({ start_date: entry.startDate, end_date: entry.endDate, hours: entry.hours, rate: entry.payRate, line_total: lineTotal });
    doc.text(formatDate(entry.startDate), colX[0], y);
    doc.text(formatDate(entry.endDate), colX[1], y);
    doc.text(String(entry.hours), colX[2], y);
    doc.text(formatCurrency(entry.payRate), colX[3], y);
    doc.text(formatCurrency(lineTotal), colX[4], y);
  });

  y += 15;

  // Totals
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin + 80, y, margin + contentWidth, y);
  y += 8;
  doc.setFont('times', 'bold');
  doc.text('Net Total:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(formatCurrency(netTotal), colX[4], y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.text('Deductions:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(formatCurrency(deductions), colX[4], y);
  y += 8;

  const totalToPay = netTotal - deductions;
  doc.setFillColor(...primaryColor);
  doc.rect(margin + 80, y - 4, contentWidth - 80, 10, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Total to Pay:', margin + 90, y + 3);
  doc.text(formatCurrency(totalToPay), colX[4], y + 3);

  // Footer - Payment Details
  y = doc.internal.pageSize.getHeight() - 55;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Payment Details', margin, y);
  y += 8;
  doc.setTextColor(...blackColor);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');

  const paymentDetails = [
    ['Payment Made To:', candidate.beneficiary_name || ''],
    ['Account Number:', candidate.account_number || ''],
    ['Sort Code:', candidate.sort_code || ''],
  ];
  paymentDetails.forEach(([label, value], index) => {
    doc.setFont('times', 'bold');
    doc.text(label, margin, y + index * 5);
    doc.setFont('times', 'normal');
    doc.text(value, margin + 35, y + index * 5);
  });

  // Final footer
  y = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('times', 'italic');
  doc.text('Self Billed Invoice - Immutable Document', pageWidth / 2, y, { align: 'center' });

  doc.setProperties({
    title: `Self Bill ${remittanceNumber}`,
    subject: 'Self Billed Invoice / Remittance Advice',
    author: 'AMEX Outsourcing',
    creator: 'AMEX Outsourcing Payroll System',
  });

  const invoiceDate = new Date(paymentDate);
  const filename = generateSelfBillFilename(candidate.candidate_name, invoiceDate);
  const pdfBlob = doc.output('blob');
  doc.save(filename);

  const candidateSnapshot: CandidateSnapshot = {
    emp_id: candidate.emp_id,
    candidate_name: candidate.candidate_name,
    address: candidate.address || 'Address not provided',
    agency: candidate.agency || undefined,
    beneficiary_name: candidate.beneficiary_name!,
    account_number: candidate.account_number!,
    sort_code: candidate.sort_code!,
    bank_name: candidate.bank_name || undefined,
  };

  return { filename, candidateSnapshot, lineItems, netTotal, deductions, totalToPay, pdfBlob, paymentDate: invoiceDate };
}

// Regenerate PDF from stored self-billed invoice data
export function regenerateSelfBillPDF(
  invoice: {
    remittance_number: string;
    payment_date: string;
    candidate_snapshot: CandidateSnapshot;
    line_items: SelfBillLineItem[];
    net_total: number;
    deductions: number;
    total_to_pay: number;
    pdf_filename: string;
  },
  invoiceSettings?: Partial<InvoiceSettings>
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const primaryColor: [number, number, number] = DEFAULT_BRANDING.primaryColor;
  const blackColor: [number, number, number] = [0, 0, 0];
  const whiteColor: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [245, 245, 245];
  const formatDate = formatDateStr;

  const candidate = invoice.candidate_snapshot;
  const lineItems = invoice.line_items as SelfBillLineItem[];

  const invoiceTo = {
    companyName: invoiceSettings?.self_bill_company_name ?? 'AMEX Outsourcing',
    addressLine1: invoiceSettings?.self_bill_address_line1 ?? '545 Northumberland Avenue',
    addressLine2: invoiceSettings?.self_bill_address_line2 ?? 'Reading, England',
    city: invoiceSettings?.self_bill_city ?? '',
    postcode: invoiceSettings?.self_bill_postcode ?? 'RG2 8NU',
  };

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text('Self Bill / Remittance Advice', pageWidth / 2, 18, { align: 'center' });

  y = 42;

  // Self Billing Invoice To
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text('Self Billing Invoice To:', margin, y);
  doc.setTextColor(...blackColor);
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  y += 6;
  doc.text(invoiceTo.companyName, margin, y);
  y += 5;
  doc.text(invoiceTo.addressLine1, margin, y);
  y += 5;
  doc.text(invoiceTo.addressLine2, margin, y);
  y += 5;
  doc.text(invoiceTo.city, margin, y);
  y += 5;
  doc.text(invoiceTo.postcode, margin, y);

  const rightX = pageWidth - margin - 60;
  let rightY = 42;
  doc.setFont('times', 'bold');
  doc.text('Remittance Number:', rightX, rightY);
  doc.setFont('times', 'normal');
  doc.text(invoice.remittance_number, rightX + 40, rightY);
  rightY += 6;
  doc.setFont('times', 'bold');
  doc.text('Payment Date:', rightX, rightY);
  doc.setFont('times', 'normal');
  doc.text(formatDate(invoice.payment_date), rightX + 40, rightY);

  y += 15;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text('Candidate:', margin, y);
  doc.setTextColor(...blackColor);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  y += 6;
  doc.text(candidate.candidate_name, margin, y);
  doc.setFont('times', 'normal');
  y += 5;
  const addressText = candidate.address || 'Address not provided';
  const addressLines = addressText.match(/.{1,60}(\s|$)/g) || [addressText];
  addressLines.forEach(line => { doc.text(line.trim(), margin, y); y += 5; });

  y += 10;

  doc.setFillColor(...lightGray);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  doc.line(margin, y + 10, margin + contentWidth, y + 10);
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(...blackColor);
  const colX = [margin + 5, margin + 35, margin + 65, margin + 100, margin + 135];
  doc.text('Start Date', colX[0], y + 7);
  doc.text('End Date', colX[1], y + 7);
  doc.text('Hours', colX[2], y + 7);
  doc.text('Rate', colX[3], y + 7);
  doc.text('Line Total', colX[4], y + 7);
  y += 10;

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  lineItems.forEach((item) => {
    y += 7;
    doc.text(formatDate(item.start_date), colX[0], y);
    doc.text(formatDate(item.end_date), colX[1], y);
    doc.text(String(item.hours), colX[2], y);
    doc.text(formatCurrency(item.rate), colX[3], y);
    doc.text(formatCurrency(item.line_total), colX[4], y);
  });

  y += 15;
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin + 80, y, margin + contentWidth, y);
  y += 8;
  doc.setFont('times', 'bold');
  doc.text('Net Total:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(formatCurrency(invoice.net_total), colX[4], y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.text('Deductions:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(formatCurrency(invoice.deductions), colX[4], y);
  y += 8;

  doc.setFillColor(...primaryColor);
  doc.rect(margin + 80, y - 4, contentWidth - 80, 10, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Total to Pay:', margin + 90, y + 3);
  doc.text(formatCurrency(invoice.total_to_pay), colX[4], y + 3);

  y = doc.internal.pageSize.getHeight() - 55;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Payment Details', margin, y);
  y += 8;
  doc.setTextColor(...blackColor);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');

  const paymentDetails = [
    ['Payment Made To:', candidate.beneficiary_name || ''],
    ['Account Number:', candidate.account_number || ''],
    ['Sort Code:', candidate.sort_code || ''],
  ];
  paymentDetails.forEach(([label, value], index) => {
    doc.setFont('times', 'bold');
    doc.text(label, margin, y + index * 5);
    doc.setFont('times', 'normal');
    doc.text(value, margin + 35, y + index * 5);
  });

  doc.save(invoice.pdf_filename);
}
