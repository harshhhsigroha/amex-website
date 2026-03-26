import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClientDashboard, InvoiceLineItem } from '@/hooks/useClientDashboard';
import { ClientSupport } from '@/components/ClientSupport';
import { ClientSidebar } from '@/components/ClientSidebar';
import { FileBrowser } from '@/components/files/FileBrowser';
import { ClientEndUserManager } from '@/components/ClientEndUserManager';
import { ClientAdminsView } from '@/components/ClientAdminsView';
import { ClientOnboardingConfig } from '@/components/ClientOnboardingConfig';
import { ClientClientsManager } from '@/components/ClientClientsManager';
import { ClientSupportToClients } from '@/components/ClientSupportToClients';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Users, 
  BarChart3,
  Loader2,
  TrendingUp,
  PoundSterling,
  Receipt,
  Calendar,
  Percent,
  Download,
} from 'lucide-react';
import { regenerateInvoicePDF } from '@/lib/pdfGenerator';
import { formatFinancialWeek, getUKFinancialPeriod } from '@/lib/ukFinancialYear';
import { DbInvoice } from '@/types/database';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(0, 0%, 15%)', 'hsl(0, 0%, 35%)'];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, loading, isClient, isAdmin } = useAuth();
  const { client, invoices, isLoading, fetchInvoiceLineItems, getAnalytics, getLinkedCandidates } = useClientDashboard();
  const { effectiveSettings: invoiceSettings } = useInvoiceSettings();
  const { whiteLabel } = useWhiteLabel(client?.id ?? null);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<DbInvoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loadingLineItems, setLoadingLineItems] = useState(false);
  const [candidates, setCandidates] = useState<{ emp_id: string; firstname: string; surname: string }[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth/client');
      } else if (!isClient) {
        if (isAdmin) navigate('/paycore');
        else navigate('/auth/client');
      }
    }
  }, [user, loading, isClient, isAdmin, navigate]);

  useEffect(() => {
    const loadCandidates = async () => {
      setLoadingCandidates(true);
      const data = await getLinkedCandidates();
      setCandidates(data);
      setLoadingCandidates(false);
    };
    if (invoices.length > 0) {
      loadCandidates();
    }
  }, [invoices, getLinkedCandidates]);

  const handleViewInvoice = async (invoice: DbInvoice) => {
    setSelectedInvoice(invoice);
    setLoadingLineItems(true);
    const items = await fetchInvoiceLineItems(invoice.id);
    setLineItems(items);
    setLoadingLineItems(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isClient) return null;

  const analytics = getAnalytics();
  const currentFinancialPeriod = getUKFinancialPeriod(new Date());

  // Prepare chart data
  const monthlyData = Object.entries(analytics.byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      total: data.total,
    }));

  const yearlyData = Object.entries(analytics.byYear).map(([year, data]) => ({
    name: year,
    value: data.total,
  }));

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent analytics={analytics} monthlyData={monthlyData} yearlyData={yearlyData} candidateCount={candidates.length} formatCurrency={formatCurrency} />;
      case 'invoices':
        return <InvoicesContent invoices={invoices} formatCurrency={formatCurrencyFull} formatDate={formatDate} onViewInvoice={handleViewInvoice} />;
      case 'candidates':
        return <CandidatesContent candidates={candidates} loading={loadingCandidates} />;
      case 'files':
        return <FileBrowser isAdmin={false} />;
      case 'clients':
        return <ClientClientsManager />;
      case 'end_users':
        return <ClientEndUserManager />;
      case 'onboarding':
        return <ClientOnboardingConfig />;
      case 'admins':
        return <ClientAdminsView />;
      case 'support_paycore':
        return <ClientSupport />;
      case 'support_clients':
        return <ClientSupportToClients />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background bg-mesh">
        <ClientSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          companyName={client?.company_name}
        />
        
        <SidebarInset className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="glass-header sticky top-0 z-20">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg hover:bg-accent/50 transition-colors" />
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-6 w-px bg-border/40" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-none">
                      {client?.company_name || 'Client Portal'}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                      {currentFinancialPeriod.financialYear} · {formatFinancialWeek(currentFinancialPeriod.financialWeek)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>

          {/* Footer */}
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

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="font-medium text-sm">
                    {formatDate(selectedInvoice.period_start)} - {formatDate(selectedInvoice.period_end)}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Financial Period</p>
                  <p className="font-medium">
                    {selectedInvoice.financial_year} / {formatFinancialWeek(selectedInvoice.financial_week)}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Grand Total</p>
                  <p className="font-bold text-primary">{formatCurrencyFull(selectedInvoice.grand_total)}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Gross</p>
                  <p className="font-semibold">{formatCurrencyFull(selectedInvoice.total_gross)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">VAT</p>
                  <p className="font-semibold">{formatCurrencyFull(selectedInvoice.total_vat)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Contractors</p>
                  <p className="font-semibold">{selectedInvoice.total_contractors}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-3">Line Items</h4>
                {loadingLineItems ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : lineItems.length > 0 ? (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">EMP ID</TableHead>
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Hours</TableHead>
                          <TableHead className="font-semibold">Rate</TableHead>
                          <TableHead className="font-semibold text-right">Pay</TableHead>
                          <TableHead className="font-semibold text-right">VAT</TableHead>
                          <TableHead className="font-semibold text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs">{item.emp_id}</TableCell>
                            <TableCell>{item.firstname} {item.surname}</TableCell>
                            <TableCell>{item.hours}</TableCell>
                            <TableCell>{formatCurrencyFull(item.pay_rate)}</TableCell>
                            <TableCell className="text-right">{formatCurrencyFull(item.pay_amount)}</TableCell>
                            <TableCell className="text-right">{formatCurrencyFull(item.vat)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrencyFull(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No line items available for this invoice
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

// Overview Content Component - Matching admin Dashboard style
function OverviewContent({ 
  analytics, 
  monthlyData, 
  yearlyData, 
  candidateCount,
  formatCurrency 
}: { 
  analytics: any; 
  monthlyData: any[]; 
  yearlyData: any[];
  candidateCount: number;
  formatCurrency: (v: number) => string;
}) {
  const avgInvoiceValue = analytics.invoiceCount > 0 ? analytics.totalRevenue / analytics.invoiceCount : 0;
  const vatPercentage = analytics.totalRevenue > 0 ? (analytics.totalVat / analytics.totalRevenue) * 100 : 0;

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
    return `£${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Your invoice overview and spending metrics</p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Spend"
          value={formatCurrency(analytics.totalRevenue)}
          sub={`${analytics.invoiceCount} invoices`}
          icon={PoundSterling}
          color="emerald"
          progressWidth={75}
        />
        <KpiCard
          label="VAT Paid"
          value={formatCurrency(analytics.totalVat)}
          sub="Included in invoices"
          icon={Receipt}
          color="amber"
          progressWidth={60}
        />
        <KpiCard
          label="Total Invoices"
          value={analytics.invoiceCount}
          sub="Generated for you"
          icon={FileText}
          color="blue"
          progressWidth={Math.min(analytics.invoiceCount * 10, 100)}
        />
        <KpiCard
          label="Contractors"
          value={candidateCount}
          sub="Linked to invoices"
          icon={Users}
          color="violet"
          progressWidth={Math.min(candidateCount * 10, 100)}
        />
      </div>

      {/* Secondary Stats — unified KpiCard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Avg Invoice" value={formatCurrency(avgInvoiceValue)} icon={TrendingUp} color="teal" />
        <KpiCard label="VAT Rate" value={`${vatPercentage.toFixed(1)}%`} icon={Percent} color="rose" />
        <KpiCard label="Gross Total" value={formatCurrency(analytics.totalRevenue - analytics.totalVat)} icon={BarChart3} color="sky" />
        <KpiCard label="Financial Years" value={yearlyData.length} icon={Calendar} color="indigo" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => formatCompact(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Total"
                    stroke="hsl(0, 72%, 51%)" 
                    strokeWidth={2.5}
                    fill="url(#spendingGradient)"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending by Year */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Spending by Financial Year
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {yearlyData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={260}>
                  <PieChart>
                    <Pie
                      data={yearlyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {yearlyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {yearlyData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Invoices Content Component
function InvoicesContent({ 
  invoices, 
  formatCurrency, 
  formatDate,
  onViewInvoice 
}: { 
  invoices: DbInvoice[]; 
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
  onViewInvoice: (invoice: DbInvoice) => void;
}) {
  const { effectiveSettings: invoiceSettings } = useInvoiceSettings();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Invoices</h2>
        <p className="text-muted-foreground text-sm mt-1">View all invoices generated for your company</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Invoice #</TableHead>
                  <TableHead className="font-semibold">FY / Week</TableHead>
                  <TableHead className="font-semibold">Period</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Contractors</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold text-center w-[80px]">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell 
                        className="font-mono text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewInvoice(invoice)}
                      >
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {invoice.financial_year} / {formatFinancialWeek(invoice.financial_week)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.total_contractors}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.grand_total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateInvoicePDF(invoice, invoiceSettings);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {invoices.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} • Click invoice number to view details
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Candidates Content Component
function CandidatesContent({ 
  candidates, 
  loading 
}: { 
  candidates: { emp_id: string; firstname: string; surname: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Contractors</h2>
        <p className="text-muted-foreground text-sm mt-1">Contractors linked to your invoices</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Linked Contractors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">EMP ID</TableHead>
                    <TableHead className="font-semibold">First Name</TableHead>
                    <TableHead className="font-semibold">Surname</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No contractors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate) => (
                      <TableRow key={candidate.emp_id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">{candidate.emp_id}</TableCell>
                        <TableCell>{candidate.firstname}</TableCell>
                        <TableCell>{candidate.surname}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {candidates.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {candidates.length} contractor{candidates.length !== 1 ? 's' : ''} linked to your invoices
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
