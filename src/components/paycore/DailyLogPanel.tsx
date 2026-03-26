import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  CalendarDays, Download, Search, FileText, Users, Building2,
  Clock, Receipt, Megaphone, MessageSquare, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const TABLE_ICONS: Record<string, React.ElementType> = {
  timesheets: Clock,
  invoices: FileText,
  self_billed_invoices: Receipt,
  candidates: Users,
  clients: Building2,
  support_tickets: MessageSquare,
  announcements: Megaphone,
  time_logs: Clock,
};

const OP_COLORS: Record<string, string> = {
  insert: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  update: 'bg-amber-500/10 text-amber-600 border-amber-200',
  delete: 'bg-destructive/10 text-destructive border-destructive/30',
};

function getOpFromEvent(event: string): string {
  const parts = event.split('.');
  return parts[parts.length - 1] || 'unknown';
}

function getTableFromEvent(event: string): string {
  const parts = event.split('.');
  return parts[0] || 'unknown';
}

function friendlyEventLabel(event: string): string {
  const table = getTableFromEvent(event).replace(/_/g, ' ');
  const op = getOpFromEvent(event);
  const opLabel = op === 'insert' ? 'Created' : op === 'update' ? 'Updated' : op === 'delete' ? 'Deleted' : op;
  return `${opLabel} ${table}`;
}

function getMetaSummary(meta: Record<string, unknown> | null): string {
  if (!meta) return '';
  const parts: string[] = [];
  if (meta.candidate_name) parts.push(`Candidate: ${meta.candidate_name}`);
  if (meta.company_name) parts.push(`Client: ${meta.company_name}`);
  if (meta.invoice_number) parts.push(`Invoice: ${meta.invoice_number}`);
  if (meta.remittance_number) parts.push(`Remittance: ${meta.remittance_number}`);
  if (meta.ticket_number) parts.push(`Ticket: ${meta.ticket_number}`);
  if (meta.title) parts.push(`Title: ${meta.title}`);
  if (meta.emp_id) parts.push(`EMP: ${meta.emp_id}`);
  if (meta.total_hours) parts.push(`Hours: ${meta.total_hours}`);
  if (meta.total_amount) parts.push(`Amount: £${Number(meta.total_amount).toFixed(2)}`);
  if (meta.grand_total) parts.push(`Total: £${Number(meta.grand_total).toFixed(2)}`);
  if (meta.total_to_pay) parts.push(`Pay: £${Number(meta.total_to_pay).toFixed(2)}`);
  if (meta.old_status && meta.new_status) parts.push(`Status: ${meta.old_status} → ${meta.new_status}`);
  else if (meta.status) parts.push(`Status: ${meta.status}`);
  return parts.join(' • ');
}

export function DailyLogPanel() {
  const [dayOffset, setDayOffset] = useState(0); // 0=today, 1=yesterday, 2=day before
  const [search, setSearch] = useState('');

  const selectedDate = subDays(new Date(), dayOffset);
  const dayStart = startOfDay(selectedDate).toISOString();
  const dayEnd = endOfDay(selectedDate).toISOString();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['daily_log', dayOffset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AuditEntry[];
    },
    refetchInterval: 15000,
  });

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      l.event_type.toLowerCase().includes(q) ||
      l.actor_email?.toLowerCase().includes(q) ||
      getMetaSummary(l.metadata).toLowerCase().includes(q)
    );
  }, [logs, search]);

  // Group by hour
  const grouped = useMemo(() => {
    const groups: Record<string, AuditEntry[]> = {};
    filtered.forEach(log => {
      const hour = format(new Date(log.created_at), 'HH:00');
      if (!groups[hour]) groups[hour] = [];
      groups[hour].push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const tables: Record<string, number> = {};
    logs.forEach(l => {
      const t = getTableFromEvent(l.event_type);
      tables[t] = (tables[t] || 0) + 1;
    });
    return {
      total: logs.length,
      actors: new Set(logs.map(l => l.actor_email).filter(Boolean)).size,
      tables: Object.entries(tables).sort((a, b) => b[1] - a[1]),
    };
  }, [logs]);

  const dayLabel = isToday(selectedDate) ? 'Today' : isYesterday(selectedDate) ? 'Yesterday' : format(selectedDate, 'EEEE');

  // PDF export
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const dateStr = format(selectedDate, 'dd MMMM yyyy');

    doc.setFontSize(18);
    doc.text('PayCore Daily Activity Log', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${dateStr}  |  Total Events: ${logs.length}  |  Active Users: ${stats.actors}`, 14, 28);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let y = 38;

    // Table summary
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Activity Summary', 14, y);
    y += 6;
    doc.setFontSize(9);
    stats.tables.forEach(([table, count]) => {
      doc.text(`  ${table.replace(/_/g, ' ')}: ${count} events`, 14, y);
      y += 5;
    });
    y += 4;

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Event Log', 14, y);
    y += 6;

    doc.setFontSize(8);
    logs.forEach(log => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const time = format(new Date(log.created_at), 'HH:mm:ss');
      const label = friendlyEventLabel(log.event_type);
      const actor = log.actor_email || 'System';
      const summary = getMetaSummary(log.metadata);

      doc.setTextColor(80);
      doc.text(time, 14, y);
      doc.setTextColor(0);
      doc.text(label, 34, y);
      doc.setTextColor(100);
      doc.text(`by ${actor}`, 90, y);
      y += 4;
      if (summary) {
        doc.setTextColor(120);
        doc.text(summary.slice(0, 100), 34, y);
        y += 4;
      }
      y += 1;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')} • PayCore by FirmFlow • Confidential`, 14, 290);

    doc.save(`PayCore_DailyLog_${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Daily Log</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Track every action on the platform — 3-day rolling history</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={logs.length === 0}>
          <Download className="h-3.5 w-3.5" />Download PDF
        </Button>
      </div>

      {/* Day selector */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={dayOffset >= 2}
          onClick={() => setDayOffset(d => Math.min(d + 1, 2))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          {[0, 1, 2].map(offset => {
            const d = subDays(new Date(), offset);
            const label = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : format(d, 'EEE');
            return (
              <Button
                key={offset}
                size="sm"
                variant={dayOffset === offset ? 'default' : 'ghost'}
                className="text-xs h-8 px-3"
                onClick={() => setDayOffset(offset)}
              >
                {label}
                <span className="ml-1 text-[10px] opacity-70">{format(d, 'dd/MM')}</span>
              </Button>
            );
          })}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={dayOffset <= 0}
          onClick={() => setDayOffset(d => Math.max(d - 1, 0))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={stats.total} icon={CalendarDays} />
        <StatCard label="Active Users" value={stats.actors} icon={Users} />
        <StatCard label="Tables Affected" value={stats.tables.length} icon={FileText} />
        <StatCard label="Day" value={dayLabel} icon={Clock} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-9 text-sm"
          placeholder="Search events, actors, details..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Activity breakdown */}
      {stats.tables.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.tables.map(([table, count]) => {
            const Icon = TABLE_ICONS[table] || FileText;
            return (
              <div key={table} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card text-xs">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{table.replace(/_/g, ' ')}</span>
                <Badge variant="secondary" className="text-[9px] h-4 px-1">{count}</Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity recorded for {dayLabel.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here automatically as the platform is used</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              {grouped.map(([hour, entries]) => (
                <div key={hour}>
                  <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-5 py-1.5 border-b border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{hour}</span>
                    <Badge variant="secondary" className="ml-2 text-[9px] h-4 px-1">{entries.length}</Badge>
                  </div>
                  <div className="divide-y divide-border/30">
                    {entries.map(log => {
                      const op = getOpFromEvent(log.event_type);
                      const table = getTableFromEvent(log.event_type);
                      const Icon = TABLE_ICONS[table] || FileText;
                      const summary = getMetaSummary(log.metadata);
                      return (
                        <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-foreground">{friendlyEventLabel(log.event_type)}</span>
                              <Badge className={cn('text-[9px] border', OP_COLORS[op] || 'bg-muted text-muted-foreground border-border')}>
                                {op}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              by {log.actor_email || 'System'} at {format(new Date(log.created_at), 'HH:mm:ss')}
                            </p>
                            {summary && (
                              <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{summary}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-bold leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
