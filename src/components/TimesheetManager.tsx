import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, MapPin, CheckCircle, XCircle, Loader2,
  Timer, FileText, Eye, Download, Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { getFinancialYearForDate, getFinancialWeekNumber, getAvailableFinancialYears, getFinancialWeeksForYear } from '@/lib/ukFinancialCalendar';
import { generateTimesheetPdf } from '@/lib/timesheetPdfGenerator';
import { generateInvoicePDF, type IssuerDetails } from '@/lib/pdfGenerator';
import { generateSelfBillPDF, type SelfBillIssuer } from '@/lib/selfBillPdfGenerator';
import { getUKFinancialPeriod } from '@/lib/ukFinancialYear';
import { getFinancialYearForDate as getFYForDate, getFinancialWeekNumber as getFWNum, generateStoragePath } from '@/lib/ukFinancialCalendar';
import type { MasterInvoice, TimesheetEntry } from '@/types/timesheet';
import type { Candidate } from '@/types/candidate';
import type { DbClient, ClientSnapshot } from '@/types/database';
import { useInvoices } from '@/hooks/useInvoices';
import { useSelfBilledInvoices } from '@/hooks/useSelfBilledInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useSubClients } from '@/hooks/useSubClients';

interface TimeLog {
  id: string;
  candidate_id: string;
  client_id: string;
  candidate_name: string;
  emp_id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_in_address: string | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  clock_out_address: string | null;
  total_hours: number | null;
  log_date: string;
  financial_week: number;
  financial_year: string;
}

interface TimesheetRow {
  id: string;
  candidate_id: string;
  candidate_name: string;
  emp_id: string;
  financial_week: number;
  financial_year: string;
  log_date: string | null;
  total_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
}

export function TimesheetManager() {
  const { user, isClient, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('logs');
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isGeneratingSelfBills, setIsGeneratingSelfBills] = useState(false);

  // Branding
  const [clientName, setClientName] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<[number, number, number] | null>(null);

  const { addInvoice } = useInvoices();
  const { addInvoice: addSelfBillInvoice, getNextRemittanceNumber } = useSelfBilledInvoices();
  const { effectiveSettings: invoiceSettings } = useInvoiceSettings();
  const { subClients, isLoading: subClientsLoading } = useSubClients();

  // Master invoice dialog state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedBillToClient, setSelectedBillToClient] = useState<string>('');

  // Filters
  const currentFY = getFinancialYearForDate(new Date());
  const [selectedYear, setSelectedYear] = useState(currentFY.label);
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  const financialYears = getAvailableFinancialYears(3);
  const selectedFYObj = financialYears.find(fy => fy.label === selectedYear) || currentFY;
  const weeks = getFinancialWeeksForYear(selectedFYObj);

  // Resolve client_id + branding
  useEffect(() => {
    if (!user || !isClient) return;
    supabase
      .from('client_users')
      .select('client_id, clients(company_name)')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const cid = data?.client_id ?? null;
        setClientId(cid);
        setClientName((data?.clients as { company_name?: string } | null)?.company_name ?? null);
      });
  }, [user, isClient]);

  // Fetch time logs
  const fetchTimeLogs = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    let query = supabase
      .from('time_logs')
      .select('*')
      .eq('client_id', clientId)
      .eq('financial_year', selectedYear)
      .order('clock_in', { ascending: false });
    if (selectedWeek !== 'all') query = query.eq('financial_week', parseInt(selectedWeek));
    const { data, error } = await query;
    if (error) { toast.error('Failed to load time logs'); }
    else { setTimeLogs((data || []) as TimeLog[]); }
    setIsLoading(false);
  }, [clientId, selectedYear, selectedWeek]);

  // Fetch timesheets
  const fetchTimesheets = useCallback(async () => {
    if (!clientId) return;
    let query = supabase
      .from('timesheets')
      .select('*')
      .eq('client_id', clientId)
      .eq('financial_year', selectedYear)
      .order('log_date', { ascending: false });
    if (selectedWeek !== 'all') query = query.eq('financial_week', parseInt(selectedWeek));
    const { data, error } = await query;
    if (!error) setTimesheets((data || []) as TimesheetRow[]);
  }, [clientId, selectedYear, selectedWeek]);

  useEffect(() => { fetchTimeLogs(); fetchTimesheets(); }, [fetchTimeLogs, fetchTimesheets]);

  // Group logs by candidate for PDF downloads
  const logsByCandidate = useMemo(() => {
    const map = new Map<string, { name: string; empId: string; candidateId: string; logs: TimeLog[] }>();
    for (const log of timeLogs) {
      if (!map.has(log.candidate_id)) {
        map.set(log.candidate_id, { name: log.candidate_name, empId: log.emp_id, candidateId: log.candidate_id, logs: [] });
      }
      map.get(log.candidate_id)!.logs.push(log);
    }
    return [...map.values()];
  }, [timeLogs]);

  // Approved timesheets
  const approvedTimesheets = useMemo(() => timesheets.filter(ts => ts.status === 'approved'), [timesheets]);

  // Generate DAILY timesheets from time logs
  const handleGenerateTimesheets = async () => {
    if (!clientId) return;
    setIsGenerating(true);
    try {
      const weekFilter = selectedWeek !== 'all' ? parseInt(selectedWeek) : null;
      let logsQuery = supabase.from('time_logs').select('*').eq('client_id', clientId).eq('financial_year', selectedYear).not('clock_out', 'is', null);
      if (weekFilter) logsQuery = logsQuery.eq('financial_week', weekFilter);
      const { data: logs } = await logsQuery;
      if (!logs || logs.length === 0) { toast.info('No completed time logs to process'); setIsGenerating(false); return; }

      // Group by candidate + log_date (daily)
      const grouped: Record<string, { candidateId: string; candidateName: string; empId: string; week: number; year: string; logDate: string; totalHours: number }> = {};
      for (const log of logs) {
        const key = `${log.candidate_id}_${log.log_date}`;
        if (!grouped[key]) grouped[key] = { candidateId: log.candidate_id, candidateName: log.candidate_name, empId: log.emp_id, week: log.financial_week, year: log.financial_year, logDate: log.log_date, totalHours: 0 };
        grouped[key].totalHours += (log.total_hours as number) || 0;
      }

      const candidateIds = [...new Set(Object.values(grouped).map(g => g.candidateId))];
      const { data: candidates } = await supabase.from('candidates').select('id, hourly_rate').in('id', candidateIds);
      const rateMap = new Map<string, number>();
      for (const c of candidates || []) rateMap.set(c.id, (c as unknown as { hourly_rate: number | null }).hourly_rate || 0);

      let created = 0;
      for (const entry of Object.values(grouped)) {
        const rate = rateMap.get(entry.candidateId) || 0;
        const totalHours = Math.round(entry.totalHours * 100) / 100;
        const totalAmount = Math.round(totalHours * rate * 100) / 100;
        const { error } = await supabase.from('timesheets').upsert({
          client_id: clientId, candidate_id: entry.candidateId, candidate_name: entry.candidateName, emp_id: entry.empId,
          financial_week: entry.week, financial_year: entry.year, log_date: entry.logDate,
          total_hours: totalHours, hourly_rate: rate, total_amount: totalAmount,
        }, { onConflict: 'client_id,candidate_id,log_date' });
        if (!error) created++;
      }
      toast.success(`${created} daily timesheet(s) generated`);
      fetchTimesheets();
    } catch { toast.error('Failed to generate timesheets'); }
    finally { setIsGenerating(false); }
  };

  // Approve/reject
  const handleStatusChange = async (timesheetId: string, status: string) => {
    const { error } = await supabase.from('timesheets').update({
      status, approved_by: status === 'approved' ? user?.id : null, approved_at: status === 'approved' ? new Date().toISOString() : null,
    }).eq('id', timesheetId);
    if (error) toast.error('Failed to update status');
    else { toast.success(`Timesheet ${status}`); fetchTimesheets(); }
  };

  // Download per-person timesheet PDF
  const handleDownloadTimesheetPdf = (candidateId: string) => {
    const group = logsByCandidate.find(g => g.candidateId === candidateId);
    if (!group) return;
    const ts = timesheets.find(t => t.candidate_id === candidateId);
    generateTimesheetPdf({
      candidateName: group.name, empId: group.empId, financialYear: selectedYear,
      financialWeek: selectedWeek === 'all' ? 'all' : parseInt(selectedWeek),
      logs: group.logs, hourlyRate: ts?.hourly_rate,
      issuerName: clientName || undefined, primaryColor: brandColor || undefined,
    });
    toast.success(`Timesheet PDF downloaded for ${group.name}`);
  };

  // Helper to save PDF to files table + storage
  const savePdfToFiles = async (
    pdfBlob: Blob, fileName: string, fileDate: Date,
    targetClientId: string, fileType: string, description: string
  ) => {
    try {
      const fy = getFYForDate(fileDate);
      const weekNumber = getFWNum(fileDate);
      const storagePath = generateStoragePath(targetClientId, fileDate, fileName);
      const { error: uploadError } = await supabase.storage.from('files').upload(storagePath, pdfBlob, { contentType: 'application/pdf', upsert: false });
      if (!uploadError) {
        await supabase.from('files').insert({
          client_id: targetClientId, uploaded_by: user!.id, file_name: fileName, file_path: storagePath,
          file_size: pdfBlob.size, mime_type: 'application/pdf', file_type: fileType,
          financial_year: fy.label, financial_week: weekNumber,
          file_date: fileDate.toISOString().split('T')[0], description,
        });
      }
    } catch (e) { console.warn('Failed to save PDF to files:', e); }
  };

  // Generate Master Invoice from approved timesheets — billed to a selected sub-client
  const handleGenerateMasterInvoice = async () => {
    if (!clientId || approvedTimesheets.length === 0 || !selectedBillToClient) return;
    setIsGeneratingInvoice(true);
    setShowInvoiceDialog(false);
    try {
      const { data: billToClient } = await supabase.from('clients').select('*').eq('id', selectedBillToClient).single();
      if (!billToClient) { toast.error('Client details not found'); return; }

      // Get date range from daily timesheets
      const dates = approvedTimesheets.map(t => t.log_date).filter(Boolean) as string[];
      const periodStart = dates.length > 0 ? dates.sort()[0] : new Date().toISOString().split('T')[0];
      const periodEnd = dates.length > 0 ? dates.sort().reverse()[0] : periodStart;

      // Build entries with proper VAT
      const entries: TimesheetEntry[] = approvedTimesheets.map(ts => {
        const nameParts = ts.candidate_name.split(' ');
        const payAmount = ts.total_amount;
        const vat = Math.round(payAmount * 0.2 * 100) / 100;
        const total = Math.round((payAmount + vat) * 100) / 100;
        return {
          empId: ts.emp_id,
          firstName: nameParts[0] || '',
          surname: nameParts.slice(1).join(' ') || '',
          timesheetId: `TS-${ts.log_date || `W${ts.financial_week}`}`,
          hours: ts.total_hours,
          payRate: ts.hourly_rate,
          payAmount,
          vat,
          total,
          umbrellaCompany: '',
          startDate: ts.log_date || new Date().toISOString().split('T')[0],
          endDate: ts.log_date || new Date().toISOString().split('T')[0],
          payDate: new Date().toISOString().split('T')[0],
        };
      });

      const totalGross = entries.reduce((sum, e) => sum + e.payAmount, 0);
      const totalVat = entries.reduce((sum, e) => sum + e.vat, 0);
      const grandTotal = Math.round((totalGross + totalVat) * 100) / 100;

      const masterInvoice: MasterInvoice = {
        invoiceType: 'master',
        umbrellaCompany: '',
        periodStart,
        periodEnd,
        payDate: new Date().toISOString().split('T')[0],
        totalContractors: new Set(approvedTimesheets.map(t => t.candidate_id)).size,
        entries,
        totalGrossPay: totalGross,
        totalVat,
        grandTotal,
      };

      const invoiceNumber = `INV-TS-${Date.now().toString(36).toUpperCase()}`;
      const clientDetails = {
        companyName: billToClient.company_name,
        addressLine1: billToClient.address_line_1,
        addressLine2: billToClient.address_line_2 || undefined,
        city: billToClient.city,
        postcode: billToClient.postcode,
        country: billToClient.country,
      };

      const issuer: IssuerDetails | undefined = clientName
        ? { companyName: clientName, tagline: 'Professional Payroll Services', primaryColor: brandColor || undefined }
        : undefined;

      const result = generateInvoicePDF(masterInvoice, clientDetails, invoiceNumber, issuer, invoiceSettings);
      const fp = getUKFinancialPeriod(result.invoiceDate);

      const clientSnapshot: ClientSnapshot = {
        company_name: billToClient.company_name,
        address_line_1: billToClient.address_line_1,
        address_line_2: billToClient.address_line_2 || undefined,
        city: billToClient.city,
        postcode: billToClient.postcode,
        country: billToClient.country,
      };

      const { success, data: savedInvoice } = await addInvoice({
        client_id: selectedBillToClient,
        invoice_number: invoiceNumber,
        invoice_date: result.invoiceDate.toISOString().split('T')[0],
        financial_year: fp.financialYear,
        financial_week: fp.financialWeek,
        period_start: periodStart,
        period_end: periodEnd,
        total_gross: totalGross,
        total_vat: totalVat,
        grand_total: grandTotal,
        total_contractors: masterInvoice.totalContractors,
        pdf_filename: result.filename,
        client_snapshot: clientSnapshot,
      });

      // Save invoice line items
      if (success && savedInvoice) {
        const lineItems = entries.map(e => ({
          invoice_id: savedInvoice.id,
          emp_id: e.empId,
          firstname: e.firstName,
          surname: e.surname,
          timesheet_id: e.timesheetId,
          hours: e.hours,
          pay_rate: e.payRate,
          pay_amount: e.payAmount,
          vat: e.vat,
          total: e.total,
          umbrella_company: e.umbrellaCompany || null,
          start_date: e.startDate,
          end_date: e.endDate,
          pay_date: e.payDate,
        }));
        const { error: lineError } = await supabase.from('invoice_line_items').insert(lineItems);
        if (lineError) console.warn('Failed to save line items:', lineError);
      }

      // Save to files
      await savePdfToFiles(result.pdfBlob, result.filename, result.invoiceDate, selectedBillToClient, 'invoice', `Master Invoice ${invoiceNumber} for ${billToClient.company_name}`);

      toast.success(`Master Invoice generated for ${billToClient.company_name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate master invoice');
    } finally { setIsGeneratingInvoice(false); }
  };

  // Generate Self-Billed Invoices from approved timesheets
  const handleGenerateSelfBills = async () => {
    if (!clientId || approvedTimesheets.length === 0) return;
    setIsGeneratingSelfBills(true);
    try {
      const candidateIds = [...new Set(approvedTimesheets.map(t => t.candidate_id))];
      const { data: candidatesData } = await supabase.from('candidates').select('*').in('id', candidateIds);
      if (!candidatesData) { toast.error('No candidate data found'); return; }

      const candidateMap = new Map<string, Candidate>();
      for (const c of candidatesData) candidateMap.set(c.id, c as unknown as Candidate);

      let successCount = 0;
      let skipCount = 0;

      for (const ts of approvedTimesheets) {
        const candidate = candidateMap.get(ts.candidate_id);
        if (!candidate || !candidate.beneficiary_name || !candidate.account_number || !candidate.sort_code) {
          skipCount++;
          continue;
        }

        const remittanceNumber = await getNextRemittanceNumber();
        const paymentDate = ts.log_date || new Date().toISOString().split('T')[0];

        const tsEntry: TimesheetEntry = {
          empId: ts.emp_id,
          firstName: ts.candidate_name.split(' ')[0] || '',
          surname: ts.candidate_name.split(' ').slice(1).join(' ') || '',
          timesheetId: `TS-${ts.log_date || `W${ts.financial_week}`}`,
          hours: ts.total_hours,
          payRate: ts.hourly_rate,
          payAmount: ts.total_amount,
          vat: 0,
          total: ts.total_amount,
          umbrellaCompany: '',
          startDate: paymentDate,
          endDate: paymentDate,
          payDate: paymentDate,
        };

        const issuer: SelfBillIssuer | undefined = clientName
          ? { companyName: clientName, primaryColor: brandColor || undefined }
          : undefined;

        const result = generateSelfBillPDF(candidate, [tsEntry], remittanceNumber, paymentDate, 0, issuer, invoiceSettings);

        await addSelfBillInvoice({
          emp_id: candidate.emp_id,
          remittance_number: remittanceNumber,
          payment_date: paymentDate,
          financial_year: ts.financial_year,
          financial_week: ts.financial_week,
          candidate_snapshot: result.candidateSnapshot,
          line_items: result.lineItems,
          net_total: result.netTotal,
          deductions: 0,
          total_to_pay: result.totalToPay,
          pdf_filename: result.filename,
        });

        // Save to files
        await savePdfToFiles(result.pdfBlob, result.filename, new Date(paymentDate), clientId, 'self_bill', `Self Bill ${remittanceNumber} for ${candidate.candidate_name}`);

        successCount++;
      }

      toast.success(`${successCount} self-bill(s) generated${skipCount > 0 ? `, ${skipCount} skipped (missing payment details)` : ''}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate self-billed invoices');
    } finally { setIsGeneratingSelfBills(false); }
  };


  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Timesheets</h2>
        <p className="text-muted-foreground">Track employee time, generate daily timesheets, and create invoices</p>
      </div>


      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Financial Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {financialYears.map(fy => (
                <SelectItem key={fy.label} value={fy.label}>{fy.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Week</Label>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {weeks.map(w => (
                <SelectItem key={w.weekNumber} value={String(w.weekNumber)}>Week {w.weekNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="logs" className="gap-2"><Timer className="h-4 w-4" /> Time Logs</TabsTrigger>
          <TabsTrigger value="timesheets" className="gap-2"><FileText className="h-4 w-4" /> Timesheets</TabsTrigger>
        </TabsList>

        {/* Time Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" /> Time Logs</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{timeLogs.length} entries</Badge>
                  {logsByCandidate.length > 0 && (
                    <Select onValueChange={handleDownloadTimesheetPdf}>
                      <SelectTrigger className="w-[200px] h-8 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        <SelectValue placeholder="Download PDF..." />
                      </SelectTrigger>
                      <SelectContent>
                        {logsByCandidate.map(g => (
                          <SelectItem key={g.candidateId} value={g.candidateId}>
                            {g.name} ({g.logs.length} logs)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : timeLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No time logs for this period</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead className="w-[60px]">Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{log.candidate_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{log.emp_id}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(log.clock_in)}</TableCell>
                          <TableCell className="font-mono text-sm">{formatTime(log.clock_in)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.clock_out ? formatTime(log.clock_out) : (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {log.total_hours != null ? `${log.total_hours}h` : '—'}
                          </TableCell>
                          <TableCell className="text-sm">W{log.financial_week}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timesheets (Daily) */}
        <TabsContent value="timesheets">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Daily Timesheets</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{timesheets.length} timesheets</Badge>
                  {approvedTimesheets.length > 0 && (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700">{approvedTimesheets.length} approved</Badge>
                  )}
                  <Button size="sm" onClick={handleGenerateTimesheets} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Generate Daily Timesheets
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Invoice generation actions for approved timesheets */}
              {approvedTimesheets.length > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <Receipt className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground flex-1">
                    Generate invoices from <strong>{approvedTimesheets.length}</strong> approved daily timesheet(s)
                  </p>
                  <Button size="sm" onClick={() => setShowInvoiceDialog(true)} disabled={isGeneratingInvoice}>
                    {isGeneratingInvoice && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Master Invoice
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleGenerateSelfBills} disabled={isGeneratingSelfBills}>
                    {isGeneratingSelfBills && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Self-Billed Invoices
                  </Button>
                </div>
              )}

              {timesheets.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No timesheets yet. Generate them from time logs above.</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheets.map(ts => (
                        <TableRow key={ts.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{ts.candidate_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{ts.emp_id}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{ts.log_date ? formatDate(ts.log_date) : '—'}</TableCell>
                          <TableCell className="text-sm">W{ts.financial_week}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold">{ts.total_hours}h</TableCell>
                          <TableCell className="font-mono text-sm">£{ts.hourly_rate.toFixed(2)}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold">£{ts.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={ts.status === 'approved' ? 'default' : ts.status === 'rejected' ? 'destructive' : 'secondary'}
                              className={ts.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                            >
                              {ts.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {ts.status !== 'approved' && (
                                <Button variant="ghost" size="sm" onClick={() => handleStatusChange(ts.id, 'approved')} title="Approve">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </Button>
                              )}
                              {ts.status !== 'rejected' && (
                                <Button variant="ghost" size="sm" onClick={() => handleStatusChange(ts.id, 'rejected')} title="Reject">
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Time Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Log Details</DialogTitle>
            <DialogDescription>{selectedLog?.candidate_name} — {selectedLog?.log_date}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Clock In</p>
                  <p className="font-mono font-semibold">{new Date(selectedLog.clock_in).toLocaleTimeString('en-GB')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Clock Out</p>
                  <p className="font-mono font-semibold">{selectedLog.clock_out ? new Date(selectedLog.clock_out).toLocaleTimeString('en-GB') : 'Active'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="font-mono font-semibold">{selectedLog.total_hours ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Financial Week</p>
                  <p className="font-semibold">Week {selectedLog.financial_week}</p>
                </div>
              </div>
              {(selectedLog.clock_in_address || selectedLog.clock_out_address) && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location Data</p>
                  {selectedLog.clock_in_address && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Clock-In Location</p>
                      <p className="text-sm">{selectedLog.clock_in_address}</p>
                      {selectedLog.clock_in_lat && <p className="text-xs text-muted-foreground font-mono">{selectedLog.clock_in_lat}, {selectedLog.clock_in_lng}</p>}
                    </div>
                  )}
                  {selectedLog.clock_out_address && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Clock-Out Location</p>
                      <p className="text-sm">{selectedLog.clock_out_address}</p>
                      {selectedLog.clock_out_lat && <p className="text-xs text-muted-foreground font-mono">{selectedLog.clock_out_lat}, {selectedLog.clock_out_lng}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Master Invoice Client Selector Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Master Invoice</DialogTitle>
            <DialogDescription>
              Select the client to bill. The invoice will include {approvedTimesheets.length} approved daily timesheet(s) with VAT at 20%.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bill To (Client)</Label>
              <Select value={selectedBillToClient} onValueChange={setSelectedBillToClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {subClients.map(sc => (
                    <SelectItem key={sc.id} value={sc.id}>{sc.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary preview */}
            {approvedTimesheets.length > 0 && (
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entries (daily)</span>
                  <span className="font-semibold">{approvedTimesheets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-mono font-semibold">{approvedTimesheets.reduce((s, t) => s + t.total_hours, 0).toFixed(2)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Pay</span>
                  <span className="font-mono">£{approvedTimesheets.reduce((s, t) => s + t.total_amount, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span className="font-mono">£{(approvedTimesheets.reduce((s, t) => s + t.total_amount, 0) * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-mono font-bold">£{(approvedTimesheets.reduce((s, t) => s + t.total_amount, 0) * 1.2).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
              <Button onClick={handleGenerateMasterInvoice} disabled={!selectedBillToClient || isGeneratingInvoice}>
                {isGeneratingInvoice && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Generate Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
