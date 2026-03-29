import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LogOut, FileText, Users, BarChart3, Headphones, Download,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Send, Plus,
  ChevronRight, HelpCircle, Building2
} from 'lucide-react';
import {
  SidebarProvider, SidebarInset, SidebarTrigger,
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PortalGuide } from '@/components/guides/PortalGuide';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { usePortalPermissions } from '@/hooks/usePortalPermissions';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PortalInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  grand_total: number;
  total_gross: number;
  total_vat: number;
  total_contractors: number;
  period_start: string;
  period_end: string;
  financial_year: string;
  financial_week: number;
  pdf_filename: string;
  client_snapshot: Record<string, unknown>;
}

interface PortalContractor {
  emp_id: string;
  firstname: string;
  surname: string;
  invoice_count: number;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface SupportMessage {
  id: string;
  message: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, group: 'Workspace', permKey: 'can_view_dashboard' as const },
  { id: 'invoices',  label: 'Invoices',  icon: FileText,  group: 'Workspace', permKey: 'can_view_invoices' as const },
  { id: 'contractors', label: 'Contractors', icon: Users, group: 'Workspace', permKey: 'can_view_contractors' as const },
  { id: 'support',   label: 'Support',   icon: Headphones, group: 'Support', permKey: 'can_view_support' as const },
  { id: 'guide',     label: 'Guide',     icon: HelpCircle, group: 'Support', permKey: null },
] as const;

type NavTab = string;

// ── Portal Sidebar ─────────────────────────────────────────────────────────────

function PortalSidebar({
  activeTab, onTabChange, companyName, userEmail, onSignOut, logoUrl, primaryColor, navItems,
}: {
  activeTab: NavTab;
  onTabChange: (t: NavTab) => void;
  companyName: string;
  userEmail: string;
  onSignOut: () => void;
  logoUrl?: string;
  primaryColor?: string | null;
  navItems: typeof allNavItems[number][];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const initials = (userEmail || '?').slice(0, 2).toUpperCase();

  const workspaceItems = navItems.filter(i => i.group === 'Workspace');
  const supportItems   = navItems.filter(i => i.group === 'Support');

  const renderGroup = (items: typeof allNavItems[number][], label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/60 px-3 mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const isActive = activeTab === item.id;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => onTabChange(item.id)}
                  tooltip={item.label}
                  className={cn(
                    'group/item relative h-9 rounded-lg transition-all duration-150',
                    isActive
                      ? 'font-medium border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
                  )}
                  style={isActive && primaryColor ? {
                    backgroundColor: primaryColor + '1a',
                    color: primaryColor,
                    borderColor: primaryColor + '33',
                  } : isActive ? undefined : undefined}
                >
                  <item.icon
                    className={cn('h-4 w-4 shrink-0 transition-colors duration-150', !isActive && 'text-muted-foreground group-hover/item:text-foreground')}
                    style={isActive && primaryColor ? { color: primaryColor } : undefined}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-70" style={primaryColor ? { color: primaryColor } : undefined} />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border glass-sidebar">
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={logoUrl || '/logo.png'}
              alt={companyName || 'Portal'}
              className="h-9 w-9 rounded-xl object-contain"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar" style={{ backgroundColor: primaryColor || '#22c55e' }} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground tracking-tight" style={primaryColor ? { color: primaryColor } : undefined}>
                {companyName || 'AMEX Outsourcing'}
              </h1>
              <p className="text-[10px] text-muted-foreground">AMEX Outsourcing Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-3 w-auto" />

      <SidebarContent className="px-2 py-3 gap-1">
        {renderGroup(workspaceItems, 'Workspace')}
        {renderGroup(supportItems, 'Support')}
      </SidebarContent>

      <Separator className="mx-3 w-auto" />

      <SidebarFooter className="p-3">
        {!isCollapsed && (
          <div className="mb-2 px-2 py-2 rounded-xl glass-subtle">
            <div className="flex items-center gap-2.5">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={primaryColor
                  ? { backgroundColor: primaryColor + '1a', color: primaryColor }
                  : { backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }
                }
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{userEmail}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor || '#22c55e' }} />
                  <p className="text-[10px] text-muted-foreground">End User</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSignOut}
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const fmt = (n: number) => `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

const getStatusIcon = (status: string) => {
  if (status === 'open') return <AlertCircle className="h-3 w-3" />;
  if (status === 'in_progress') return <Clock className="h-3 w-3" />;
  if (status === 'resolved' || status === 'closed') return <CheckCircle2 className="h-3 w-3" />;
  return <HelpCircle className="h-3 w-3" />;
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
});

// ── Dashboard Tab ─────────────────────────────────────────────────────────────

function DashboardTab({ invoices, contractors }: { invoices: PortalInvoice[]; contractors: PortalContractor[] }) {
  const totalSpend = invoices.reduce((s, i) => s + Number(i.grand_total), 0);
  const totalGross = invoices.reduce((s, i) => s + Number(i.total_gross), 0);
  const recentInvoices = invoices.slice(0, 5);

  const kpis = [
    { label: 'Total Invoices', value: String(invoices.length), icon: FileText, accent: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'Total Spend', value: fmt(totalSpend), icon: TrendingUp, accent: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Gross Labour', value: fmt(totalGross), icon: BarChart3, accent: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Contractors', value: String(contractors.length), icon: Users, accent: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Your company's invoice and contractor summary</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className={cn('border-border/50 relative overflow-hidden group hover:shadow-md transition-shadow')}>
            <div className={cn('absolute top-0 left-0 right-0 h-0.5', kpi.bg)} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110', kpi.bg)}>
                  <kpi.icon className={cn('h-4 w-4', kpi.accent)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No invoices yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.invoice_date)} · Week {inv.financial_week}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px]">{inv.total_contractors} contractors</Badge>
                    <span className="font-semibold text-sm">{fmt(Number(inv.grand_total))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────

function InvoicesTab({ invoices, clientId }: { invoices: PortalInvoice[]; clientId: string }) {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  const years = [...new Set(invoices.map(i => i.financial_year))].sort().reverse();
  const filtered = invoices.filter(i => {
    const matchSearch = i.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'all' || i.financial_year === yearFilter;
    return matchSearch && matchYear;
  });

  const handleDownload = async (inv: PortalInvoice) => {
    try {
      const { data: files } = await supabase
        .from('files')
        .select('file_path')
        .eq('client_id', clientId)
        .ilike('file_name', `%${inv.invoice_number}%`)
        .limit(1)
        .maybeSingle();

      if (files?.file_path) {
        const { data: blob } = await supabase.storage.from('files').download(files.file_path);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = inv.pdf_filename; a.click();
          URL.revokeObjectURL(url); return;
        }
      }
      toast.error('PDF not found in storage');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Invoices</h2>
        <p className="text-sm text-muted-foreground mt-1">All invoices raised against your company</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search invoice number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-9 text-sm"
        />
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground self-center">{filtered.length} invoices</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-30" />
          <p className="text-sm">No invoices found</p>
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(inv.invoice_date)} · {inv.financial_year} · Week {inv.financial_week}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-sm">{fmt(Number(inv.grand_total))}</p>
                      <p className="text-xs text-muted-foreground">{inv.total_contractors} contractors</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => handleDownload(inv)}>
                      <Download className="h-3.5 w-3.5" />Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Contractors Tab ───────────────────────────────────────────────────────────

function ContractorsTab({ contractors }: { contractors: PortalContractor[] }) {
  const [search, setSearch] = useState('');
  const filtered = contractors.filter(c =>
    `${c.firstname} ${c.surname}`.toLowerCase().includes(search.toLowerCase()) ||
    c.emp_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Contractors</h2>
        <p className="text-sm text-muted-foreground mt-1">Workers placed at your company</p>
      </div>

      <Input
        placeholder="Search by name or ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-xs h-9 text-sm"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">No contractors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <Card key={c.emp_id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {c.firstname[0]}{c.surname[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.firstname} {c.surname}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.emp_id}</p>
                    <p className="text-xs text-muted-foreground">{c.invoice_count} invoice{c.invoice_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Support Tab ───────────────────────────────────────────────────────────────

function SupportTab({ userId, clientId, userEmail }: { userId: string; clientId: string; userEmail: string }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setMessages((data as SupportMessage[]) || []);
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (selectedTicket) loadMessages(selectedTicket.id);
  }, [selectedTicket?.id]);

  const createTicket = async () => {
    if (!form.subject || !form.description) { toast.error('Please fill in subject and description'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: userId,
      client_id: clientId,
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
      subject: form.subject,
      description: form.description,
      priority: form.priority as 'low' | 'medium' | 'high' | 'urgent',
      status: 'open',
    });
    if (error) { toast.error('Failed to create ticket'); }
    else {
      toast.success('Ticket submitted');
      setForm({ subject: '', description: '', priority: 'medium' });
      setIsCreateOpen(false);
      fetchTickets();
    }
    setSubmitting(false);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    setSendingMessage(true);
    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      message: newMessage.trim(),
      is_admin: false,
    });
    setNewMessage('');
    loadMessages(selectedTicket.id);
    setSendingMessage(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Help & Support</h2>
          <p className="text-sm text-muted-foreground mt-1">Raise and track support requests</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(v => !v)}>
          <Plus className="h-4 w-4" />New Ticket
        </Button>
      </div>

      {/* Create ticket form */}
      {isCreateOpen && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">New Support Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject *</Label>
              <Input className="h-9 text-sm" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description *</Label>
              <Textarea className="text-sm min-h-[80px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your issue in detail..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" onClick={createTicket} disabled={submitting}>
                <Send className="h-3.5 w-3.5" />{submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket list + chat panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Headphones className="h-4 w-4" />
              Your Tickets
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <Badge variant="destructive" className="text-[10px] ml-auto">
                  {tickets.filter(t => t.status === 'open').length} open
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No tickets yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Create a ticket to get help</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                        selectedTicket?.id === ticket.id && 'bg-muted'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground">{ticket.ticket_number}</span>
                        <Badge variant="outline" className={cn('text-[10px] gap-1', statusColors[ticket.status])}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm text-foreground truncate">{ticket.subject}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={cn('text-[10px]', priorityColors[ticket.priority])}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(ticket.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <Card className="lg:col-span-2 border-border/50">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTicket.ticket_number} · {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('gap-1 text-[10px]', statusColors[selectedTicket.status])}>
                    {getStatusIcon(selectedTicket.status)}
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-lg">
                  {selectedTicket.description}
                </p>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[400px]">
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Headphones className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div key={msg.id} className={cn('flex', msg.sender_id === userId ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-[80%] rounded-xl px-4 py-2',
                            msg.sender_id === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={cn(
                              'text-[10px] mt-1',
                              msg.sender_id === userId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {msg.sender_id === userId ? 'You' : 'Support'} · {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={selectedTicket.status === 'closed' || selectedTicket.status === 'resolved'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim() || selectedTicket.status === 'closed'}
                    >
                      {sendingMessage ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                    <p className="text-xs text-muted-foreground mt-2">This ticket is {selectedTicket.status}.</p>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
              <Headphones className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">Select a ticket to view conversation</p>
              <p className="text-xs mt-1">Or create a new ticket for support</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Main Portal Dashboard ─────────────────────────────────────────────────────

interface WhiteLabelConfig {
  enabled: boolean;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_domain: string | null;
}

export default function PortalDashboard() {
  const navigate = useNavigate();
  const { user, loading, identityReady, isPortalUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [contractors, setContractors] = useState<PortalContractor[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [parentClientId, setParentClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [dataLoading, setDataLoading] = useState(true);
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig | null>(null);
  const { permissions: portalPerms, loading: permsLoading } = usePortalPermissions(parentClientId || clientId || null);

  useEffect(() => {
    if (!loading && identityReady) {
      if (!user || !isPortalUser) navigate('/auth/portal');
    }
  }, [user, loading, identityReady, isPortalUser, navigate]);

  const fetchData = useCallback(async () => {
    if (!user || !isPortalUser) return;
    setDataLoading(true);

    const { data: link } = await supabase
      .from('portal_users')
      .select('client_id, sub_client_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!link) { setDataLoading(false); return; }

    const effectiveClientId = link.sub_client_id || link.client_id;
    setClientId(effectiveClientId);
    setParentClientId(link.client_id);

    const { data: clientRec } = await supabase
      .from('clients')
      .select('company_name')
      .eq('id', effectiveClientId)
      .maybeSingle();
    setClientName(clientRec?.company_name || '');

    const { data: wl } = await supabase
      .from('client_white_label')
      .select('*')
      .eq('client_id', link.client_id)
      .maybeSingle();
    setWhiteLabel(wl as WhiteLabelConfig | null);

    const { data: invData } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', effectiveClientId)
      .order('invoice_date', { ascending: false });

    const parsedInvoices: PortalInvoice[] = (invData || []).map(i => ({
      ...i,
      client_snapshot: i.client_snapshot as Record<string, unknown>,
    }));
    setInvoices(parsedInvoices);

    if (parsedInvoices.length > 0) {
      const invoiceIds = parsedInvoices.map(i => i.id);
      const { data: lineItems } = await supabase
        .from('invoice_line_items')
        .select('emp_id, firstname, surname, invoice_id')
        .in('invoice_id', invoiceIds);

      const contractorMap = new Map<string, PortalContractor>();
      (lineItems || []).forEach(item => {
        if (!contractorMap.has(item.emp_id)) {
          contractorMap.set(item.emp_id, { emp_id: item.emp_id, firstname: item.firstname, surname: item.surname, invoice_count: 0 });
        }
        contractorMap.get(item.emp_id)!.invoice_count++;
      });
      setContractors(Array.from(contractorMap.values()).sort((a, b) => a.surname.localeCompare(b.surname)));
    }

    setDataLoading(false);
  }, [user, isPortalUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply white-label CSS variables dynamically
  useEffect(() => {
    if (!whiteLabel?.enabled) return;
    const root = document.documentElement;
    if (whiteLabel.primary_color) {
      // Convert hex to approximate HSL for CSS var
      root.style.setProperty('--wl-primary', whiteLabel.primary_color);
    }
    if (whiteLabel.secondary_color) {
      root.style.setProperty('--wl-secondary', whiteLabel.secondary_color);
    }
    return () => {
      root.style.removeProperty('--wl-primary');
      root.style.removeProperty('--wl-secondary');
    };
  }, [whiteLabel]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/portal');
  };

  // Derive display values from white label (if enabled)
  const wlEnabled = whiteLabel?.enabled;
  const displayName = (wlEnabled && whiteLabel?.brand_name) ? whiteLabel.brand_name : (clientName || 'AMEX Outsourcing');
  const displayLogo = (wlEnabled && whiteLabel?.logo_url) ? whiteLabel.logo_url : '/logo.png';
  const primaryHex = (wlEnabled && whiteLabel?.primary_color) ? whiteLabel.primary_color : null;

  if (loading || !identityReady) return <LoadingScreen />;
  if (!user || !isPortalUser) return null;

  // Filter nav items based on portal permissions
  const filteredNavItems = allNavItems.filter(item => {
    if (!item.permKey) return true; // guide always visible
    return portalPerms[item.permKey];
  });

  // If active tab was hidden, reset to first available
  const validTabIds = filteredNavItems.map(i => i.id);
  const effectiveTab = validTabIds.includes(activeTab) ? activeTab : (validTabIds[0] || 'guide');

  const renderContent = () => {
    if (dataLoading || permsLoading) return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );

    switch (effectiveTab) {
      case 'dashboard': return <DashboardTab invoices={invoices} contractors={contractors} />;
      case 'invoices':  return <InvoicesTab invoices={invoices} clientId={clientId} />;
      case 'contractors': return <ContractorsTab contractors={contractors} />;
      case 'support':   return <SupportTab userId={user.id} clientId={clientId} userEmail={user.email || ''} />;
      case 'guide':     return <PortalGuide />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background bg-mesh">
        <PortalSidebar
          activeTab={effectiveTab}
          onTabChange={setActiveTab}
          companyName={displayName}
          userEmail={user.email || ''}
          onSignOut={handleSignOut}
          logoUrl={displayLogo}
          primaryColor={primaryHex}
          navItems={[...filteredNavItems]}
        />

        <SidebarInset className="flex flex-col">
          {/* Header */}
          <header
            className="h-14 glass-header sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6"
            style={primaryHex ? { background: primaryHex + '0d', backdropFilter: 'blur(20px)' } : undefined}
          >
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2.5 flex-1">
              {wlEnabled && whiteLabel?.logo_url && (
                <img src={whiteLabel.logo_url} alt={displayName} className="h-7 w-7 object-contain rounded" />
              )}
              {(!wlEnabled || !whiteLabel?.logo_url) && (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
              <p
                className="text-sm font-semibold"
                style={primaryHex ? { color: primaryHex } : undefined}
              >
                {displayName}
              </p>
            </div>
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] backdrop-blur-sm"
              style={primaryHex ? { backgroundColor: primaryHex + '1a', color: primaryHex, borderColor: primaryHex + '4d' } : undefined}
            >
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={primaryHex ? { backgroundColor: primaryHex } : { backgroundColor: 'hsl(var(--emerald-500))' }}
              />
              Live
            </Badge>
          </header>

          <PullToRefresh onRefresh={fetchData} className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              {renderContent()}
            </div>
          </PullToRefresh>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

