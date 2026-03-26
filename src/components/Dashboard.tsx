import { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/ui/KpiCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DbInvoice, DbSelfBilledInvoice, DbClient, DbCandidate } from '@/types/database';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line,
} from 'recharts';
import { 
  TrendingUp, Users, Building2, FileText, Receipt, PoundSterling, 
  Percent, Download, Clock, UserCheck, Target, Banknote, Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  invoices: DbInvoice[];
  selfBillInvoices: DbSelfBilledInvoice[];
  clients: DbClient[];
  candidates: DbCandidate[];
  isClientView?: boolean;
}

export function Dashboard({ invoices, selfBillInvoices, clients, candidates, isClientView = false }: DashboardProps) {
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const stats = useMemo(() => {
    const totalInvoiceRevenue = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
    const totalSelfBillPaid = selfBillInvoices.reduce((sum, inv) => sum + Number(inv.total_to_pay), 0);
    const totalVat = invoices.reduce((sum, inv) => sum + Number(inv.total_vat), 0);
    const totalContractors = new Set(selfBillInvoices.map(inv => inv.emp_id)).size;
    const avgInvoiceValue = invoices.length > 0 ? totalInvoiceRevenue / invoices.length : 0;
    const grossMargin = totalInvoiceRevenue > 0 ? ((totalInvoiceRevenue - totalSelfBillPaid) / totalInvoiceRevenue) * 100 : 0;
    const avgContractorPay = selfBillInvoices.length > 0 ? totalSelfBillPaid / selfBillInvoices.length : 0;

    return {
      totalInvoices: invoices.length,
      totalSelfBills: selfBillInvoices.length,
      totalClients: clients.length,
      totalCandidates: candidates.length,
      totalInvoiceRevenue,
      totalSelfBillPaid,
      totalVat,
      totalContractors,
      avgInvoiceValue,
      grossMargin,
      avgContractorPay,
    };
  }, [invoices, selfBillInvoices, clients, candidates]);

  const weeklyTrend = useMemo(() => {
    const grouped: Record<string, { week: string; revenue: number; payments: number; weekNum: number }> = {};
    invoices.forEach(inv => {
      const key = `W${inv.financial_week}`;
      if (!grouped[key]) grouped[key] = { week: key, revenue: 0, payments: 0, weekNum: inv.financial_week };
      grouped[key].revenue += Number(inv.grand_total);
    });
    selfBillInvoices.forEach(inv => {
      const key = `W${inv.financial_week}`;
      if (!grouped[key]) grouped[key] = { week: key, revenue: 0, payments: 0, weekNum: inv.financial_week };
      grouped[key].payments += Number(inv.total_to_pay);
    });
    return Object.values(grouped).sort((a, b) => a.weekNum - b.weekNum).slice(-12);
  }, [invoices, selfBillInvoices]);

  const invoicesByClient = useMemo(() => {
    const grouped: Record<string, { name: string; value: number }> = {};
    invoices.forEach(inv => {
      const name = inv.client_snapshot.company_name;
      if (!grouped[name]) grouped[name] = { name, value: 0 };
      grouped[name].value += Number(inv.grand_total);
    });
    return Object.values(grouped).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [invoices]);

  const topContractors = useMemo(() => {
    const grouped: Record<string, { name: string; totalPaid: number; count: number }> = {};
    selfBillInvoices.forEach(inv => {
      const snap = inv.candidate_snapshot as any;
      const name = snap?.candidate_name || inv.emp_id;
      if (!grouped[inv.emp_id]) grouped[inv.emp_id] = { name, totalPaid: 0, count: 0 };
      grouped[inv.emp_id].totalPaid += Number(inv.total_to_pay);
      grouped[inv.emp_id].count += 1;
    });
    return Object.values(grouped).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 6);
  }, [selfBillInvoices]);

  const recentActivity = useMemo(() => {
    const items: { type: string; label: string; detail: string; date: string; amount: number }[] = [];
    invoices.slice(0, 4).forEach(inv => {
      items.push({ type: 'invoice', label: inv.invoice_number, detail: inv.client_snapshot.company_name, date: inv.created_at, amount: Number(inv.grand_total) });
    });
    selfBillInvoices.slice(0, 4).forEach(inv => {
      const snap = inv.candidate_snapshot as any;
      items.push({ type: 'selfbill', label: inv.remittance_number, detail: snap?.candidate_name || inv.emp_id, date: inv.created_at, amount: Number(inv.total_to_pay) });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [invoices, selfBillInvoices]);

  const COLORS = ['hsl(221, 83%, 53%)', 'hsl(260, 60%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 55%)'];

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatCompact = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
    return `£${value.toFixed(0)}`;
  };

  const handleDownloadReport = useCallback(() => {
    const now = new Date();
    const isWeekly = reportPeriod === 'weekly';
    const cutoff = new Date();
    if (isWeekly) cutoff.setDate(cutoff.getDate() - 7);
    else cutoff.setMonth(cutoff.getMonth() - 1);

    const periodInvoices = invoices.filter(inv => new Date(inv.created_at) >= cutoff);
    const periodSelfBills = selfBillInvoices.filter(inv => new Date(inv.created_at) >= cutoff);

    const totalRev = periodInvoices.reduce((s, i) => s + Number(i.grand_total), 0);
    const totalPaid = periodSelfBills.reduce((s, i) => s + Number(i.total_to_pay), 0);

    let csv = `PayCore ${isWeekly ? 'Weekly' : 'Monthly'} Report\nGenerated: ${now.toLocaleDateString('en-GB')}\n\n`;
    csv += `SUMMARY\nMetric,Value\nTotal Revenue,${formatCurrency(totalRev)}\nTotal Payments,${formatCurrency(totalPaid)}\nNet Margin,${formatCurrency(totalRev - totalPaid)}\n\n`;
    csv += `INVOICES\nInvoice,Client,Date,Total\n`;
    periodInvoices.forEach(inv => { csv += `${inv.invoice_number},${inv.client_snapshot.company_name},${inv.invoice_date},${inv.grand_total}\n`; });
    csv += `\nSELF-BILLS\nRemittance,EMP ID,Date,Total\n`;
    periodSelfBills.forEach(inv => { csv += `${inv.remittance_number},${inv.emp_id},${inv.payment_date},${inv.total_to_pay}\n`; });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PayCore_Report_${isWeekly ? 'Weekly' : 'Monthly'}_${now.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  }, [reportPeriod, invoices, selfBillInvoices]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(0 0% 100% / 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid hsl(0 0% 100% / 0.5)',
    borderRadius: '16px',
    fontSize: '12px',
    boxShadow: '0 12px 40px -8px hsl(220 20% 10% / 0.12)',
    padding: '12px 16px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Financial overview & analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportPeriod} onValueChange={(v: 'weekly' | 'monthly') => setReportPeriod(v)}>
            <SelectTrigger className="w-[120px] h-8 text-xs glass-input rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadReport} size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-xl">
            <Download className="h-3.5 w-3.5" />Report
          </Button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(stats.totalInvoiceRevenue)} sub={`${stats.totalInvoices} invoices`} icon={PoundSterling} color="emerald" progressWidth={75} />
        <KpiCard label="Contractor Payments" value={formatCurrency(stats.totalSelfBillPaid)} sub={`${stats.totalSelfBills} remittances`} icon={Receipt} color="amber" progressWidth={60} />
        <KpiCard label={isClientView ? 'Your Account' : 'Active Clients'} value={stats.totalClients} sub={isClientView ? 'Company account' : 'Registered'} icon={Building2} color="blue" progressWidth={Math.min(stats.totalClients * 20, 100)} />
        <KpiCard label="Contractors" value={stats.totalCandidates} sub={`${stats.totalContractors} with payments`} icon={Users} color="violet" progressWidth={Math.min((stats.totalContractors / Math.max(stats.totalCandidates, 1)) * 100, 100)} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Avg Invoice" value={formatCurrency(stats.avgInvoiceValue)} icon={TrendingUp} color="teal" />
        <KpiCard label="Gross Margin" value={`${stats.grossMargin.toFixed(1)}%`} icon={Percent} color="rose" />
        <KpiCard label="VAT Collected" value={formatCurrency(stats.totalVat)} icon={FileText} color="sky" />
        <KpiCard label="Net Margin" value={formatCurrency(stats.totalInvoiceRevenue - stats.totalSelfBillPaid)} icon={Target} color="indigo" />
        <KpiCard label="Avg Contractor" value={formatCurrency(stats.avgContractorPay)} icon={Banknote} color="orange" />
      </div>

      {/* Main chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              Weekly Financial Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(260, 60%, 55%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(260, 60%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="payments" name="Payments" stroke="hsl(260, 60%, 55%)" strokeWidth={2} fill="url(#payGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-accent/40 transition-colors border-b border-border/20 last:border-0">
                    <div className={`p-2 rounded-xl ${item.type === 'invoice' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                      {item.type === 'invoice' ? <FileText className="h-3.5 w-3.5 text-emerald-600" /> : <Receipt className="h-3.5 w-3.5 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold tabular-nums">{formatCurrency(item.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              Revenue by Client
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {invoicesByClient.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="45%" height={200}>
                  <PieChart>
                    <Pie data={invoicesByClient} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {invoicesByClient.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {invoicesByClient.map((c, idx) => (
                    <div key={c.name} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground truncate flex-1">{c.name}</span>
                      <span className="text-xs font-bold tabular-nums">{formatCompact(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No client data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              Top Contractors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topContractors.length > 0 ? (
              <div className="space-y-3">
                {topContractors.map((c, i) => {
                  const maxPaid = topContractors[0]?.totalPaid || 1;
                  const pct = (c.totalPaid / maxPaid) * 100;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-bold text-muted-foreground/50 w-4 tabular-nums">{i + 1}</span>
                          <span className="text-xs font-medium truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-lg">{c.count}</Badge>
                          <span className="text-xs font-bold tabular-nums">{formatCompact(c.totalPaid)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-primary/50 to-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No contractor data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
