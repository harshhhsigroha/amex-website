import { jsPDF } from 'jspdf';
import { DEFAULT_BRANDING } from '@/types/invoice';

interface TimeLogForPdf {
  clock_in: string;
  clock_out: string | null;
  clock_in_address: string | null;
  clock_out_address: string | null;
  total_hours: number | null;
  log_date: string;
  financial_week: number;
}

interface TimesheetPdfOptions {
  candidateName: string;
  empId: string;
  financialYear: string;
  financialWeek: number | 'all';
  logs: TimeLogForPdf[];
  hourlyRate?: number;
  issuerName?: string;
  primaryColor?: [number, number, number];
}

const formatCurrency = (v: number) =>
  `£${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export function generateTimesheetPdf(opts: TimesheetPdfOptions): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const primary: [number, number, number] = opts.primaryColor || DEFAULT_BRANDING.primaryColor;
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const gray: [number, number, number] = [245, 245, 245];
  const issuer = opts.issuerName || DEFAULT_BRANDING.companyName;

  // Header
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text(issuer, margin, 14);
  doc.setFontSize(18);
  doc.text('TIMESHEET', pageWidth - margin, 16, { align: 'right' });

  let y = 38;

  // Candidate info
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text(opts.candidateName, margin, y);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.text(`Emp ID: ${opts.empId}`, margin, y + 6);
  doc.text(
    `${opts.financialYear} — ${opts.financialWeek === 'all' ? 'All Weeks' : `Week ${opts.financialWeek}`}`,
    margin,
    y + 12
  );
  if (opts.hourlyRate) {
    doc.text(`Hourly Rate: ${formatCurrency(opts.hourlyRate)}`, pageWidth - margin, y + 6, { align: 'right' });
  }

  y += 22;

  // Sort logs by date then clock_in
  const sorted = [...opts.logs].sort(
    (a, b) => new Date(a.clock_in).getTime() - new Date(b.clock_in).getTime()
  );

  // Table header
  doc.setFillColor(...gray);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setDrawColor(...black);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  doc.line(margin, y + 9, margin + contentWidth, y + 9);

  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  const cols = [margin + 3, margin + 42, margin + 62, margin + 82, margin + 98, margin + 130];
  doc.text('Date', cols[0], y + 6);
  doc.text('Clock In', cols[1], y + 6);
  doc.text('Clock Out', cols[2], y + 6);
  doc.text('Hours', cols[3], y + 6);
  doc.text('Location (In)', cols[4], y + 6);
  doc.text('Location (Out)', cols[5], y + 6);
  y += 9;

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  let totalHours = 0;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const log of sorted) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
    y += 6;
    doc.text(formatDate(log.clock_in), cols[0], y);
    doc.text(formatTime(log.clock_in), cols[1], y);
    doc.text(log.clock_out ? formatTime(log.clock_out) : 'Active', cols[2], y);
    const hrs = log.total_hours ?? 0;
    totalHours += hrs;
    doc.text(hrs ? `${hrs}h` : '—', cols[3], y);
    const inAddr = (log.clock_in_address || '').substring(0, 28);
    const outAddr = (log.clock_out_address || '').substring(0, 28);
    doc.text(inAddr, cols[4], y);
    doc.text(outAddr, cols[5], y);
  }

  // Totals
  y += 12;
  doc.setDrawColor(...black);
  doc.line(margin + 70, y, margin + contentWidth, y);
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('Total Hours:', margin + 75, y);
  doc.text(`${Math.round(totalHours * 100) / 100}h`, margin + 100, y);

  if (opts.hourlyRate) {
    y += 6;
    doc.text('Gross Pay:', margin + 75, y);
    doc.text(formatCurrency(totalHours * opts.hourlyRate), margin + 100, y);
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('times', 'italic');
  doc.text(`Generated ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, footerY, { align: 'center' });

  const weekLabel = opts.financialWeek === 'all' ? 'AllWeeks' : `W${opts.financialWeek}`;
  const cleanName = opts.candidateName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  doc.save(`Timesheet_${cleanName}_${opts.financialYear.replace(/\s/g, '')}_${weekLabel}.pdf`);
}
