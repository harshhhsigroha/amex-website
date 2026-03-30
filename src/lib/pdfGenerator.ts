import { jsPDF } from 'jspdf';
import { MasterInvoice } from '@/types/timesheet';
import { ClientDetails, DEFAULT_CONFIG, DEFAULT_BRANDING } from '@/types/invoice';
import { DbInvoice } from '@/types/database';
import { generateInvoiceFilename } from '@/lib/ukFinancialYear';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';

const formatCurrency = (value: number): string => {
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateStr = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDate = formatDateStr;

export interface GeneratedInvoiceResult {
  filename: string;
  invoiceDate: Date;
  pdfBlob: Blob;
}

// Issuer info passed from the calling portal (the logged-in user's own company)
export interface IssuerDetails {
  companyName: string;
  tagline?: string;
  primaryColor?: [number, number, number]; // RGB override from white-label
}

export function generateInvoicePDF(
  invoice: MasterInvoice,
  clientDetails: ClientDetails,
  invoiceNumber: string,
  issuer?: IssuerDetails,
  invoiceSettings?: Partial<InvoiceSettings>
): GeneratedInvoiceResult {
  const invoiceDate = new Date();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Use issuer details if provided, fallback to DEFAULT_BRANDING
  const issuerName = issuer?.companyName || DEFAULT_BRANDING.companyName;
  const issuerTagline = issuer?.tagline || DEFAULT_BRANDING.tagline;

  // Use branding colors — prefer white-label override
  const primaryColor: [number, number, number] = issuer?.primaryColor || DEFAULT_BRANDING.primaryColor;
  const blackColor: [number, number, number] = [0, 0, 0];
  const whiteColor: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [245, 245, 245];

  // Header with custom branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(...whiteColor);
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.text(issuerName, margin, 18);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text(issuerTagline, margin, 26);

  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.text('INVOICE', pageWidth - margin, 22, { align: 'right' });

  y = 50;

  // Invoice details section (right side)
  doc.setTextColor(...blackColor);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');

  const detailsX = pageWidth - margin - 60;
  
  doc.setFont('times', 'bold');
  doc.text('Invoice Number:', detailsX, y);
  doc.setFont('times', 'normal');
  doc.text(invoiceNumber, detailsX + 35, y);

  doc.setFont('times', 'bold');
  doc.text('Invoice Date:', detailsX, y + 6);
  doc.setFont('times', 'normal');
  doc.text(formatDate(new Date()), detailsX + 35, y + 6);

  doc.setFont('times', 'bold');
  doc.text('VAT No:', detailsX, y + 12);
  doc.setFont('times', 'normal');
  doc.text(invoiceSettings?.vat_number ?? DEFAULT_CONFIG.vatNumber, detailsX + 35, y + 12);

  doc.setFont('times', 'bold');
  doc.text('Payment Terms:', detailsX, y + 18);
  doc.setFont('times', 'normal');
  doc.text('Due on Receipt', detailsX + 35, y + 18);

  // Bill To section (left side)
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Bill To:', margin, y);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(...blackColor);

  let billY = y + 8;
  doc.setFont('times', 'bold');
  doc.text(clientDetails.companyName, margin, billY);
  doc.setFont('times', 'normal');
  billY += 5;
  doc.text(clientDetails.addressLine1, margin, billY);
  if (clientDetails.addressLine2) {
    billY += 5;
    doc.text(clientDetails.addressLine2, margin, billY);
  }
  billY += 5;
  doc.text(`${clientDetails.city}, ${clientDetails.postcode}`, margin, billY);
  billY += 5;
  doc.text(clientDetails.country, margin, billY);

  y = Math.max(billY, y + 30) + 15;

  // Line items table header
  doc.setFillColor(...lightGray);
  doc.rect(margin, y, contentWidth, 10, 'F');

  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  doc.line(margin, y + 10, margin + contentWidth, y + 10);

  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(...blackColor);

  const colX = [margin + 5, margin + 35, margin + 115, margin + 145];

  doc.text('Date', colX[0], y + 7);
  doc.text('Description', colX[1], y + 7);
  doc.text('Unit Price', colX[2], y + 7);
  doc.text('Amount', colX[3], y + 7);

  y += 10;

  // Line item
  doc.setFont('times', 'normal');
  doc.setFontSize(9);

  y += 8;
  doc.text(invoice.periodEnd, colX[0], y);
  doc.text('Payroll Services', colX[1], y);
  doc.text(formatCurrency(invoice.totalGrossPay), colX[2], y);
  doc.text(formatCurrency(invoice.totalGrossPay), colX[3], y);

  y += 15;

  // Totals section
  doc.setDrawColor(...blackColor);
  doc.setLineWidth(0.3);
  doc.line(margin + 100, y, margin + contentWidth, y);

  y += 8;

  // Subtotal
  doc.setFont('times', 'normal');
  doc.text('Subtotal:', margin + 110, y);
  doc.text(formatCurrency(invoice.totalGrossPay), margin + 145, y);

  y += 6;

  // VAT
  doc.text('VAT (20%):', margin + 110, y);
  doc.text(formatCurrency(invoice.totalVat), margin + 145, y);

  y += 8;

  // Total bar with custom color
  doc.setFillColor(...primaryColor);
  doc.rect(margin + 100, y - 4, contentWidth - 100, 10, 'F');

  doc.setTextColor(...whiteColor);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', margin + 110, y + 3);
  doc.text(formatCurrency(invoice.grandTotal), margin + 145, y + 3);

  // Footer - Payment details
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
    ['Bank Name:', invoiceSettings?.bank_name ?? DEFAULT_CONFIG.bankName],
    ['Sort Code:', invoiceSettings?.sort_code ?? DEFAULT_CONFIG.sortCode],
    ['Account Number:', invoiceSettings?.account_number ?? DEFAULT_CONFIG.accountNumber],
    ['Reference:', invoiceNumber],
  ];

  paymentDetails.forEach(([label, value], index) => {
    doc.setFont('times', 'bold');
    doc.text(label, margin, y + index * 5);
    doc.setFont('times', 'normal');
    doc.text(value, margin + 35, y + index * 5);
  });

  // Remittance email
  doc.setFont('times', 'bold');
  doc.text('Remittance Email:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(invoiceSettings?.remittance_email ?? DEFAULT_CONFIG.remittanceEmail, margin + 125, y);

  // Final footer
  y = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('times', 'italic');
  doc.text('Thank you for your business', pageWidth / 2, y, { align: 'center' });

  // Set document properties (read-only)
  doc.setProperties({
    title: `Invoice ${invoiceNumber}`,
    subject: 'AMEX Outsourcing Invoice',
    author: 'AMEX Outsourcing',
    creator: 'AMEX Admin Payroll System',
  });

  // Generate filename per naming convention
  const filename = generateInvoiceFilename(clientDetails.companyName, invoiceDate, 'pdf');

  // Generate blob for storage and download
  const pdfBlob = doc.output('blob');
  
  // Download
  doc.save(filename);

  return { filename, invoiceDate, pdfBlob };
}

// Regenerate PDF from stored invoice data
export function regenerateInvoicePDF(invoice: DbInvoice, invoiceSettings?: Partial<InvoiceSettings>): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const primaryColor: [number, number, number] = DEFAULT_BRANDING.primaryColor;
  const blackColor: [number, number, number] = [0, 0, 0];
  const whiteColor: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [245, 245, 245];

  const clientSnapshot = invoice.client_snapshot;

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(...whiteColor);
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.text(DEFAULT_BRANDING.companyName, margin, 18);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text(DEFAULT_BRANDING.tagline, margin, 26);

  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.text('INVOICE', pageWidth - margin, 22, { align: 'right' });

  y = 50;

  // Invoice details
  doc.setTextColor(...blackColor);
  doc.setFontSize(9);
  const detailsX = pageWidth - margin - 60;

  doc.setFont('times', 'bold');
  doc.text('Invoice Number:', detailsX, y);
  doc.setFont('times', 'normal');
  doc.text(invoice.invoice_number, detailsX + 35, y);

  doc.setFont('times', 'bold');
  doc.text('Invoice Date:', detailsX, y + 6);
  doc.setFont('times', 'normal');
  doc.text(formatDateStr(new Date(invoice.invoice_date)), detailsX + 35, y + 6);

  doc.setFont('times', 'bold');
  doc.text('VAT No:', detailsX, y + 12);
  doc.setFont('times', 'normal');
  doc.text(invoiceSettings?.vat_number ?? DEFAULT_CONFIG.vatNumber, detailsX + 35, y + 12);

  // Bill To
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Bill To:', margin, y);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(...blackColor);

  let billY = y + 8;
  doc.setFont('times', 'bold');
  doc.text(clientSnapshot.company_name, margin, billY);
  doc.setFont('times', 'normal');
  billY += 5;
  doc.text(clientSnapshot.address_line_1, margin, billY);
  if (clientSnapshot.address_line_2) {
    billY += 5;
    doc.text(clientSnapshot.address_line_2, margin, billY);
  }
  billY += 5;
  doc.text(`${clientSnapshot.city}, ${clientSnapshot.postcode}`, margin, billY);
  billY += 5;
  doc.text(clientSnapshot.country, margin, billY);

  y = Math.max(billY, y + 30) + 15;

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

  const colX = [margin + 5, margin + 35, margin + 115, margin + 145];
  doc.text('Date', colX[0], y + 7);
  doc.text('Description', colX[1], y + 7);
  doc.text('Unit Price', colX[2], y + 7);
  doc.text('Amount', colX[3], y + 7);

  y += 10;

  // Line item
  doc.setFont('times', 'normal');
  y += 8;
  doc.text(formatDateStr(new Date(invoice.period_end)), colX[0], y);
  doc.text('Payroll Services', colX[1], y);
  doc.text(formatCurrency(invoice.total_gross), colX[2], y);
  doc.text(formatCurrency(invoice.total_gross), colX[3], y);

  y += 15;

  // Totals
  doc.setDrawColor(...blackColor);
  doc.line(margin + 100, y, margin + contentWidth, y);
  y += 8;

  doc.text('Subtotal:', margin + 110, y);
  doc.text(formatCurrency(invoice.total_gross), margin + 145, y);
  y += 6;

  doc.text('VAT (20%):', margin + 110, y);
  doc.text(formatCurrency(invoice.total_vat), margin + 145, y);
  y += 8;

  // Total bar
  doc.setFillColor(...primaryColor);
  doc.rect(margin + 100, y - 4, contentWidth - 100, 10, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', margin + 110, y + 3);
  doc.text(formatCurrency(invoice.grand_total), margin + 145, y + 3);

  // Footer
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
    ['Bank Name:', invoiceSettings?.bank_name ?? DEFAULT_CONFIG.bankName],
    ['Sort Code:', invoiceSettings?.sort_code ?? DEFAULT_CONFIG.sortCode],
    ['Account Number:', invoiceSettings?.account_number ?? DEFAULT_CONFIG.accountNumber],
    ['Reference:', invoice.invoice_number],
  ];

  paymentDetails.forEach(([label, value], index) => {
    doc.setFont('times', 'bold');
    doc.text(label, margin, y + index * 5);
    doc.setFont('times', 'normal');
    doc.text(value, margin + 35, y + index * 5);
  });

  doc.setFont('times', 'bold');
  doc.text('Remittance Email:', margin + 90, y);
  doc.setFont('times', 'normal');
  doc.text(invoiceSettings?.remittance_email ?? DEFAULT_CONFIG.remittanceEmail, margin + 125, y);

  // Download
  doc.save(invoice.pdf_filename);
}
