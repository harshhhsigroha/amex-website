import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  Building2, TrendingUp, AlertTriangle, CreditCard,
  FileText, CheckCircle2, ShieldCheck, Users2, AlertCircle, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useClients } from '@/hooks/useClients';
import { PRICING_PLANS } from './ClientManager';

const COLORS = ['hsl(221,83%,53%)', 'hsl(262,80%,58%)', 'hsl(38,92%,50%)', 'hsl(160,60%,45%)'];

export function AMEX OutsourcingDashboard() {
  const { clients } = useClients();

  const { data: plans = [] } = useQuery({
    queryKey: ['all_plans_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('client_plans').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: billing = [] } = useQuery({
    queryKey: ['all_billing_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('client_billing_records').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['all_tickets_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['all_invoices_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices').select('client_id, created_at, invoice_number, grand_total').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: clientUsers = [] } = useQuery({
    queryKey: ['all_client_users_count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('client_users').select('client_id');
      if (error) throw error;
      return data;
    },
  });

  const { data: portalUsers = [] } = useQuery({
    queryKey: ['all_portal_users_count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portal_users').select('client_id');
      if (error) throw error;
      return data;
    },
  });

  // KPIs
  const totalMRR = plans.reduce((sum: number, p: any) => {
    if (p.status !== 'active') return sum;
    return sum + (p.billing_cycle === 'annual' ? p.monthly_fee / 12 : p.monthly_fee);
  }, 0);

  const pendingBilling = billing.filter((b: any) => b.status === 'pending').reduce((s: number, b: any) => s + b.amount, 0);
  const overdueBilling = billing.filter((b: any) => b.status === 'overdue');
  const openTickets = tickets.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;
  const totalUsers = clientUsers.length + portalUsers.length;

  // Plan distribution
  const tierDist = ['volume_starter', 'volume_pro', 'volume_enterprise', 'team'].map(tier => ({
    name: PRICING_PLANS.find(p => p.id === tier)?.label.split(' – ')[1] || tier,
    value: plans.filter((p: any) => p.plan_tier === tier).length,
  })).filter(d => d.value > 0);

  const statusDist = ['active', 'trial', 'suspended', 'cancelled'].map(status => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count: plans.filter((p: any) => p.status === status).length,
  })).filter(d => d.count > 0);

  // Candidate limit alerts
  const clientsNearLimit = clients
    .map(client => {
      const plan = plans.find((p: any) => p.client_id === client.id);
      if (!plan) return null;
      const pp = PRICING_PLANS.find(p => p.id === plan.plan_tier);
      if (!pp?.candidateLimit) return null;
      const contracted = plan.notes ? parseInt(plan.notes.match(/candidates:(\d+)/)?.[1] || '0') : 0;
      const usage = contracted / pp.candidateLimit;
      if (usage >= 0.75) return { client, plan, contracted, limit: pp.candidateLimit, usage };
      return null;
    })
    .filter(Boolean) as { client: any; plan: any; contracted: number; limit: number; usage: number }[];

  // Security overview
  const suspendedClients = plans.filter((p: any) => p.status === 'suspended').length;
  const noPlansClients = clients.filter(c => !plans.some((p: any) => p.client_id === c.id));

  const statusBadgeClass = (status: string) => {
    if (status === 'open') return 'bg-blue-500/10 text-blue-600 border-blue-200';
    if (status === 'in_progress') return 'bg-amber-500/10 text-amber-600 border-amber-200';
    if (status === 'resolved') return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    return 'bg-muted text-muted-foreground border-border';
  };

  const priorityBadgeClass = (priority: string) => {
    if (priority === 'urgent') return 'bg-red-500/10 text-red-600 border-red-200';
    if (priority === 'high') return 'bg-amber-500/10 text-amber-600 border-amber-200';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">AMEX Outsourcing platform health at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total Clients" value={clients.length} sub="registered companies" icon={Building2} color="blue" progressWidth={Math.min(clients.length * 10, 100)} />
        <KpiCard label="Monthly MRR" value={`£${totalMRR.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`} sub="recurring revenue" icon={TrendingUp} color="emerald" progressWidth={75} />
        <KpiCard label="Pending Billing" value={`£${pendingBilling.toFixed(0)}`} sub="to collect" icon={CreditCard} color="amber" progressWidth={pendingBilling > 0 ? 60 : 0} />
        <KpiCard label="Open Tickets" value={openTickets} sub="need attention" icon={AlertTriangle} color="red" progressWidth={Math.min(openTickets * 20, 100)} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users2, sub: `${clientUsers.length} company · ${portalUsers.length} portal` },
          { label: 'Active Plans', value: plans.filter((p: any) => p.status === 'active').length, icon: CheckCircle2, sub: `of ${plans.length} total` },
          { label: 'Invoices', value: invoices.length, icon: FileText, sub: 'generated this period' },
          { label: 'Overdue Bills', value: overdueBilling.length, icon: AlertCircle, sub: overdueBilling.length > 0 ? `£${overdueBilling.reduce((s: number, b: any) => s + b.amount, 0).toFixed(0)} owed` : 'All clear' },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{value}</p>
              <p className="text-[10px] text-muted-foreground font-medium truncate">{label}</p>
              <p className="text-[10px] text-muted-foreground/70 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Client Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {tierDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tierDist} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {tierDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <FileText className="h-8 w-8 opacity-30" />
                <p className="text-sm">No plan data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Client Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusDist} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={70} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">No status data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Limit Alerts */}
      {clientsNearLimit.length > 0 && (
        <Card className="border-amber-200 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold text-amber-700">Candidate Limit Alerts</CardTitle>
              <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">{clientsNearLimit.length} client{clientsNearLimit.length !== 1 ? 's' : ''}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {clientsNearLimit.map(({ client, contracted, limit, usage }) => (
              <div key={client.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{client.company_name}</span>
                  <span className={`font-semibold ${usage >= 1 ? 'text-destructive' : 'text-amber-600'}`}>
                    {contracted}/{limit} candidates ({Math.round(usage * 100)}%)
                  </span>
                </div>
                <Progress value={Math.min(usage * 100, 100)} className="h-1.5" />
                {usage >= 1 && (
                  <p className="text-[10px] text-destructive">⚠ Over limit — consider upgrading their plan</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Security & Platform Health */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Platform Health & Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border ${suspendedClients > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-emerald-200 bg-emerald-500/5'}`}>
              <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-muted-foreground">Suspended Clients</p>
              <p className={`text-xl font-bold ${suspendedClients > 0 ? 'text-destructive' : 'text-emerald-600'}`}>{suspendedClients}</p>
              <p className="text-[10px] text-muted-foreground">{suspendedClients === 0 ? 'All active' : 'Require attention'}</p>
            </div>
            <div className={`p-3 rounded-lg border ${noPlansClients.length > 0 ? 'border-amber-200 bg-amber-500/5' : 'border-emerald-200 bg-emerald-500/5'}`}>
              <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-muted-foreground">No Plan Assigned</p>
              <p className={`text-xl font-bold ${noPlansClients.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{noPlansClients.length}</p>
              <p className="text-[10px] text-muted-foreground">{noPlansClients.length === 0 ? 'All clients billed' : 'Missing billing plan'}</p>
            </div>
            <div className={`p-3 rounded-lg border ${overdueBilling.length > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-emerald-200 bg-emerald-500/5'}`}>
              <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-muted-foreground">Overdue Invoices</p>
              <p className={`text-xl font-bold ${overdueBilling.length > 0 ? 'text-destructive' : 'text-emerald-600'}`}>{overdueBilling.length}</p>
              <p className="text-[10px] text-muted-foreground">{overdueBilling.length === 0 ? 'No overdue payments' : `£${overdueBilling.reduce((s: number, b: any) => s + b.amount, 0).toFixed(0)} outstanding`}</p>
            </div>
          </div>

          {noPlansClients.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/60">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Clients without a billing plan:</p>
              <div className="flex flex-wrap gap-1.5">
                {noPlansClients.map(c => (
                  <Badge key={c.id} variant="outline" className="text-[10px]">{c.company_name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Clients */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Clients</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{clients.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {clients.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
                <Building2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">No clients registered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...clients].slice(0, 5).map(client => {
                  const plan = plans.find((p: any) => p.client_id === client.id);
                  return (
                    <div key={client.id} className="flex items-center justify-between py-2 px-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-xs text-foreground">{client.company_name}</p>
                          <p className="text-muted-foreground text-[11px]">{client.city}, {client.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan ? (
                          <span className="text-xs font-semibold text-foreground">
                            £{plan.monthly_fee.toLocaleString()}<span className="font-normal text-muted-foreground">/mo</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">No plan</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Support Tickets</CardTitle>
              {openTickets > 0 && (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block animate-pulse" />
                  {openTickets} open
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tickets.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">No tickets yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(tickets as any[]).slice(0, 5).map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between py-2 px-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-xs">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-medium text-foreground truncate">{ticket.subject}</p>
                      <p className="text-muted-foreground mt-0.5">{ticket.ticket_number} · {new Date(ticket.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`text-[10px] border ${priorityBadgeClass(ticket.priority)}`}>{ticket.priority}</Badge>
                      <Badge className={`text-[10px] border ${statusBadgeClass(ticket.status)}`}>{ticket.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
