import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { InvoiceSummary } from '@/components/InvoiceSummary';
import { TimesheetTable } from '@/components/TimesheetTable';
import { ClientSelector } from '@/components/ClientSelector';
import { ClientManagement } from '@/components/ClientManagement';
import { InvoiceHistory } from '@/components/InvoiceHistory';
import { CandidateMasterUpload } from '@/components/CandidateMasterUpload';
import { CandidateList } from '@/components/CandidateList';
import { SelfBillGenerator } from '@/components/SelfBillGenerator';
import { SelfBillHistory } from '@/components/SelfBillHistory';
import AdminPanel from '@/components/AdminPanel';
import { AdminSupport } from '@/components/AdminSupport';
import { ClientSupport } from '@/components/ClientSupport';
import { AppSidebar } from '@/components/AppSidebar';

import { ClientTeamManagement } from '@/components/ClientTeamManagement';
import { ClientSupportToClients } from '@/components/ClientSupportToClients';
import { TimesheetUpload } from '@/components/invoice/TimesheetUpload';
import { InvoiceGenerator } from '@/components/invoice/InvoiceGenerator';
import { RestrictedContent } from '@/components/layout/RestrictedContent';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { FileBrowser } from '@/components/files/FileBrowser';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ClientCandidateOnboarding } from '@/components/ClientCandidateOnboarding';
import { TimesheetManager } from '@/components/TimesheetManager';
import { ClientOnboardingConfig } from '@/components/ClientOnboardingConfig';
import { OpsGuide } from '@/components/guides/OpsGuide';
import { AnnouncementsBanner } from '@/components/AnnouncementsBanner';
import { InvoiceSettingsPanel } from '@/components/InvoiceSettingsPanel';
import { parseExcelFile, exportToExcel } from '@/lib/excelParser';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { getUKFinancialPeriod, validateFinancialDate, formatFinancialWeek } from '@/lib/ukFinancialYear';
import { getFinancialYearForDate, getFinancialWeekNumber, generateStoragePath } from '@/lib/ukFinancialCalendar';
import { MasterInvoice } from '@/types/timesheet';
import { DbClient, ClientSnapshot } from '@/types/database';
import { useClients } from '@/hooks/useClients';
import { useSubClients } from '@/hooks/useSubClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useCandidates } from '@/hooks/useCandidates';
import { useSelfBilledInvoices } from '@/hooks/useSelfBilledInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Generate default invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-001`;
};

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, identityReady, isAdmin, isSuperAdmin, isClient } = useAuth();
  const { hasPermission, loading: permissionsLoading } = useAdminPermissions();
  
  // Invoice state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<MasterInvoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<DbClient | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
  const [activeTab, setActiveTab] = useState<string>('');
  const [myClientId, setMyClientId] = useState<string | null>(null);
  const [myClientName, setMyClientName] = useState<string | null>(null);
  const [myBrandColor, setMyBrandColor] = useState<[number, number, number] | null>(null);
  const { whiteLabel } = useWhiteLabel(myClientId);

  // Data hooks
  const { clients, isLoading: clientsLoading, addClient, updateClient, deleteClient } = useClients();
  const { subClients, isLoading: subClientsLoading, addSubClient, updateSubClient } = useSubClients();
  const { invoices, isLoading: invoicesLoading, addInvoice, filters, setFilters, refetch: refetchInvoices, getFinancialYears, getFinancialWeeks } = useInvoices();
  const { effectiveSettings: invoiceSettings } = useInvoiceSettings();
  const { candidates, isLoading: candidatesLoading, upsertCandidates, updateCandidate, addCandidate, getCandidateByEmpId, getCandidateByName, clearAllCandidates } = useCandidates();
  const { invoices: selfBillInvoices, isLoading: selfBillLoading, filters: selfBillFilters, setFilters: setSelfBillFilters, addInvoice: addSelfBillInvoice, getNextRemittanceNumber, getFinancialYears: getSelfBillYears, getFinancialWeeks: getSelfBillWeeks, refreshInvoices: refreshSelfBillInvoices } = useSelfBilledInvoices();

  // Resolve client_id, company name, and white-label color for branded PDF generation
  useEffect(() => {
    if (!user || !isClient) return;
    supabase
      .from('client_users')
      .select('client_id, clients(company_name)')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const cid = data?.client_id ?? null;
        setMyClientId(cid);
        const name = (data?.clients as { company_name?: string } | null)?.company_name ?? null;
        setMyClientName(name);

        // Also fetch white-label primary color for branded PDFs
        if (cid) {
          supabase
            .from('client_white_label')
            .select('primary_color, enabled')
            .eq('client_id', cid)
            .maybeSingle()
            .then(({ data: wl }) => {
              if (wl?.enabled && wl.primary_color) {
                const hex = wl.primary_color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                  setMyBrandColor([r, g, b]);
                }
              }
            });
        }
      });
  }, [user, isClient]);

  // Set default tab based on permissions
  useEffect(() => {
    if (!permissionsLoading && !activeTab) {
      if (isSuperAdmin || hasPermission('can_view_dashboard')) setActiveTab('dashboard');
      else if (hasPermission('can_generate_invoices')) setActiveTab('create');
      else if (hasPermission('can_generate_self_bills')) setActiveTab('selfbill');
      else if (hasPermission('can_manage_candidates')) setActiveTab('candidates');
      else if (hasPermission('can_view_history')) setActiveTab('history');
      else if (isClient) setActiveTab('dashboard');
      else setActiveTab('noaccess');
    }
  }, [permissionsLoading, isSuperAdmin, isClient, hasPermission, activeTab]);

  // Auth redirect — wait for identityReady to avoid race condition
  // ── Auth redirect — send unauthenticated or unauthorized users away ──
  useEffect(() => {
    if (!loading && identityReady) {
      if (!user) navigate('/auth/client');
      else if (!isClient && !isAdmin) navigate('/auth/client');
      // Both admins and clients stay on /dashboard — unified portal
    }
  }, [user, loading, identityReady, isAdmin, isClient, navigate]);

  // Handlers
  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setInvoice(null);

    const result = await parseExcelFile(file);
    if (result.success && result.data) {
      setInvoice(result.data);
      toast.success('Timesheet processed', { description: `${result.data.entries.length} entries loaded` });
    } else {
      setError(result.error || 'Unknown error');
      toast.error('Failed to process file');
    }
    setIsProcessing(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (invoice) {
      await exportToExcel(invoice);
      toast.success('Export complete', { description: 'MASTER_INVOICE.xlsx downloaded' });
    }
  }, [invoice]);

  const handleReset = useCallback(() => {
    setInvoice(null);
    setError(null);
    setSelectedClient(null);
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    if (!invoice || !selectedClient || !invoiceNumber.trim()) {
      toast.error(!invoice ? 'No invoice data' : !selectedClient ? 'Select a client first' : 'Invoice number required');
      return;
    }

    const validation = validateFinancialDate(new Date());
    if (!validation.valid) {
      toast.error('Cannot determine UK financial period', { description: validation.error });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const clientDetails = {
        companyName: selectedClient.company_name,
        addressLine1: selectedClient.address_line_1,
        addressLine2: selectedClient.address_line_2 || undefined,
        city: selectedClient.city,
        postcode: selectedClient.postcode,
        country: selectedClient.country,
      };

      const result = generateInvoicePDF(invoice, clientDetails, invoiceNumber, 
        myClientName ? { companyName: myClientName, tagline: 'Professional Payroll Services', primaryColor: myBrandColor || undefined } : undefined,
        invoiceSettings
      );
      const financialPeriod = getUKFinancialPeriod(result.invoiceDate);

      const clientSnapshot: ClientSnapshot = {
        company_name: selectedClient.company_name,
        address_line_1: selectedClient.address_line_1,
        address_line_2: selectedClient.address_line_2 || undefined,
        city: selectedClient.city,
        postcode: selectedClient.postcode,
        country: selectedClient.country,
      };

      // Save invoice to database
      await addInvoice({
        client_id: selectedClient.id,
        invoice_number: invoiceNumber,
        invoice_date: result.invoiceDate.toISOString().split('T')[0],
        financial_year: financialPeriod.financialYear,
        financial_week: financialPeriod.financialWeek,
        period_start: invoice.periodStart,
        period_end: invoice.periodEnd,
        total_gross: invoice.totalGrossPay,
        total_vat: invoice.totalVat,
        grand_total: invoice.grandTotal,
        total_contractors: invoice.totalContractors,
        pdf_filename: result.filename,
        client_snapshot: clientSnapshot,
      });

      // Upload PDF to Files system
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const fy = getFinancialYearForDate(result.invoiceDate);
          const weekNumber = getFinancialWeekNumber(result.invoiceDate);
          const storagePath = generateStoragePath(
            selectedClient.id,
            result.invoiceDate,
            result.filename
          );

          // Upload to storage bucket
          const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(storagePath, result.pdfBlob, {
              contentType: 'application/pdf',
              upsert: false
            });

          if (!uploadError) {
            // Create file metadata record
            await supabase.from('files').insert({
              client_id: selectedClient.id,
              uploaded_by: currentUser.id,
              file_name: result.filename,
              file_path: storagePath,
              file_size: result.pdfBlob.size,
              mime_type: 'application/pdf',
              file_type: 'invoice',
              financial_year: fy.label,
              financial_week: weekNumber,
              file_date: result.invoiceDate.toISOString().split('T')[0],
              description: `Master Invoice ${invoiceNumber} for ${selectedClient.company_name}`,
            });
          }
        }
      } catch (fileError) {
        console.warn('Failed to save PDF to files system:', fileError);
        // Don't fail the whole operation if file save fails
      }

      toast.success('Invoice Generated & Saved', { description: `${result.filename} downloaded and saved to Files` });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [invoice, selectedClient, invoiceNumber, addInvoice]);

  // Refetch history data when switching to history tabs
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'history') {
      refetchInvoices();
    } else if (tab === 'selfbill-history') {
      refreshSelfBillInvoices();
    }
  }, [refetchInvoices, refreshSelfBillInvoices]);

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([refetchInvoices(), refreshSelfBillInvoices()]);
  }, [refetchInvoices, refreshSelfBillInvoices]);

  // Loading states
  if (loading || !identityReady || permissionsLoading) return <LoadingScreen />;
  if (!user || (!isAdmin && !isClient)) return null;

  const currentFinancialPeriod = getUKFinancialPeriod(new Date());

  // Content renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return hasPermission('can_view_dashboard') 
          ? (
            <div className="space-y-4">
              <AnnouncementsBanner />
              <Dashboard invoices={invoices} selfBillInvoices={selfBillInvoices} clients={isClient ? subClients : clients} candidates={candidates} isClientView={isClient} />
            </div>
          )
          : <RestrictedContent message="You don't have permission to view the dashboard." />;

      case 'create':
        if (!hasPermission('can_generate_invoices')) {
          return <RestrictedContent message="You don't have permission to generate master invoices." />;
        }
        if (!invoice) {
          return <TimesheetUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} error={error} />;
        }
        return (
          <div className="space-y-6">
            <InvoiceSummary invoice={invoice} />
            <TimesheetTable invoice={invoice} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-3xl mx-auto">
              <ClientSelector
                clients={isClient ? subClients : clients}
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                onSaveNewClient={isClient && myClientId
                  ? (c) => addSubClient(c, myClientId)
                  : addClient}
                onUpdateClient={isClient ? updateSubClient : updateClient}
                isLoading={isClient ? subClientsLoading : clientsLoading}
                isClientMode={isClient}
              />
              <InvoiceGenerator selectedClient={selectedClient} invoiceNumber={invoiceNumber} onInvoiceNumberChange={setInvoiceNumber} onExport={handleExport} onGeneratePDF={handleGeneratePDF} isGeneratingPDF={isGeneratingPDF} />
            </div>
          </div>
        );

      case 'selfbill':
        if (!hasPermission('can_generate_self_bills')) {
          return <RestrictedContent message="You don't have permission to generate self-billed invoices." />;
        }
        if (!invoice) {
          return <TimesheetUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} error={error} title="Self-Billed Invoices" description="Upload a timesheet to generate self-billed invoices for contractors" />;
        }
        return (
          <div className="space-y-6">
            <InvoiceSummary invoice={invoice} />
            <TimesheetTable invoice={invoice} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <CandidateMasterUpload onUpload={upsertCandidates} candidateCount={candidates.length} isLoading={candidatesLoading} />
              <SelfBillGenerator invoice={invoice} candidates={candidates} getCandidateByEmpId={getCandidateByEmpId} getCandidateByName={getCandidateByName} addCandidate={addCandidate} addInvoice={addSelfBillInvoice} getNextRemittanceNumber={getNextRemittanceNumber} onComplete={() => { refreshSelfBillInvoices(); toast.success('All self-billed invoices generated'); }} issuer={myClientName ? { companyName: myClientName, primaryColor: myBrandColor || undefined } : undefined} invoiceSettings={invoiceSettings} />
              <div className="flex flex-col justify-center items-center p-6 border border-border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3 w-full">
                  <Button size="lg" onClick={handleExport} className="w-full"><Download className="h-5 w-5 mr-2" />Export Excel</Button>
                  <Button variant="outline" size="lg" onClick={handleReset} className="w-full"><RefreshCw className="h-5 w-5 mr-2" />New Upload</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clients':
        return hasPermission('can_manage_clients')
          ? <ClientManagement clients={clients} isLoading={clientsLoading} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} invoices={invoices} />
          : <RestrictedContent message="You don't have permission to manage clients." />;

      case 'candidates':
        return hasPermission('can_manage_candidates') ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Candidate Master Management</h2>
              <p className="text-muted-foreground">View and edit candidate details. Payment edits only affect future invoices.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1"><CandidateMasterUpload onUpload={upsertCandidates} candidateCount={candidates.length} isLoading={candidatesLoading} /></div>
              <div className="lg:col-span-3"><CandidateList candidates={candidates} isLoading={candidatesLoading} onUpdateCandidate={updateCandidate} onAddCandidate={addCandidate} onClearAll={clearAllCandidates} /></div>
            </div>
          </div>
        ) : <RestrictedContent message="You don't have permission to manage candidates." />;

      case 'timesheets':
        return isClient ? <TimesheetManager /> : <RestrictedContent message="Access denied." />;

      case 'history':
        return hasPermission('can_view_history') 
          ? <InvoiceHistory invoices={invoices} clients={isClient ? subClients : clients} filters={filters} onFiltersChange={setFilters} financialYears={getFinancialYears()} financialWeeks={getFinancialWeeks(filters.financialYear)} isLoading={invoicesLoading} />
          : <RestrictedContent message="You don't have permission to view invoice history." />;

      case 'selfbill-history':
        return hasPermission('can_view_history') 
          ? <SelfBillHistory invoices={selfBillInvoices} filters={selfBillFilters} onFiltersChange={setSelfBillFilters} financialYears={getSelfBillYears()} financialWeeks={getSelfBillWeeks(selfBillFilters.financialYear)} isLoading={selfBillLoading} />
          : <RestrictedContent message="You don't have permission to view self-bill history." />;

      case 'files':
        return hasPermission('can_view_history')
          ? <FileBrowser isAdmin={true} />
          : <RestrictedContent message="You don't have permission to access files." />;

      case 'support':
        return isClient ? (
          <Tabs defaultValue="our-tickets" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="our-tickets">Our Tickets</TabsTrigger>
              <TabsTrigger value="client-inbox">Client Inbox</TabsTrigger>
            </TabsList>
            <TabsContent value="our-tickets"><ClientSupport /></TabsContent>
            <TabsContent value="client-inbox"><ClientSupportToClients /></TabsContent>
          </Tabs>
        ) : <AdminSupport />;

      case 'team':
        if (isSuperAdmin) return <AdminPanel />;
        if (isClient) return <ClientTeamManagement />;
        return <RestrictedContent message="Access denied." />;

      case 'onboard-candidates':
        return isClient
          ? <ClientCandidateOnboarding />
          : <RestrictedContent message="Access denied." />;

      case 'onboarding-form':
        return isClient
          ? <ClientOnboardingConfig />
          : <RestrictedContent message="Access denied." />;

      case 'invoice-settings':
        return (isSuperAdmin || isClient) ? <InvoiceSettingsPanel /> : <RestrictedContent message="Access denied." />;

      case 'guide':
        return <OpsGuide />;

      default:
        return <RestrictedContent message="You have no permissions assigned. Please contact your administrator." />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background bg-mesh">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <SidebarInset className="flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="glass-header sticky top-0 z-20">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg hover:bg-accent/50 transition-colors" />
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-6 w-px bg-border/40" />
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground leading-none">{myClientName || 'Operations Portal'}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                        {currentFinancialPeriod.financialYear} · {formatFinancialWeek(currentFinancialPeriod.financialWeek)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {invoice && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5 rounded-xl">
                      <RefreshCw className="h-3.5 w-3.5" />New Upload
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExport} className="h-8 text-xs gap-1.5 rounded-xl glass-input">
                      <Download className="h-3.5 w-3.5" />Export
                    </Button>
                  </>
                )}
                {/* Period badge */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
                </div>
              </div>
            </div>
          </header>

          <PullToRefresh onRefresh={handlePullRefresh} className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto pb-6">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </PullToRefresh>

          <footer className="glass-header border-t border-b-0">
            <div className="px-6 py-3 flex items-center justify-between">
              {(!whiteLabel || !whiteLabel.hide_powered_by) && (
                <p className="text-[11px] text-muted-foreground">AMEX Outsourcing</p>
              )}
              <p className="text-[11px] text-muted-foreground ml-auto">UK Financial Year: 6 Apr – 5 Apr</p>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
