import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Shield, Search, Activity, Clock, User, FileText, AlertTriangle, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  auth: User,
  invoice: FileText,
  client: Activity,
  candidate: User,
  billing: FileText,
  security: Shield,
};

const EVENT_COLORS: Record<string, string> = {
  login: 'bg-blue-500/10 text-blue-600 border-blue-200',
  logout: 'bg-muted text-muted-foreground border-border',
  create: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  update: 'bg-amber-500/10 text-amber-600 border-amber-200',
  delete: 'bg-red-500/10 text-red-600 border-red-200',
  error: 'bg-red-500/10 text-red-600 border-red-200',
  view: 'bg-slate-500/10 text-slate-600 border-slate-200',
};

function getEventColor(eventType: string): string {
  for (const [key, color] of Object.entries(EVENT_COLORS)) {
    if (eventType.toLowerCase().includes(key)) return color;
  }
  return 'bg-muted text-muted-foreground border-border';
}

export function AuditLog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AuditEntry[];
    },
    refetchInterval: 30000,
  });

  const eventTypes = [...new Set(logs.map(l => l.event_type))].sort();

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      (log.actor_email?.toLowerCase().includes(search.toLowerCase())) ||
      log.event_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.target_type?.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || log.event_type === typeFilter;
    return matchSearch && matchType;
  });

  const formatDate = (d: string) => new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Audit Log</h2>
        </div>
        <p className="text-sm text-muted-foreground">Immutable record of all significant platform events — UK GDPR Article 30 compliant</p>
      </div>

      {/* Compliance notice */}
      <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Immutable Record</p>
          <p>Audit log entries cannot be modified or deleted. This log satisfies UK GDPR Article 30 (Records of Processing Activities) and ICO accountability requirements. Retain for a minimum of 3 years.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: logs.length, icon: Activity },
          { label: 'Today', value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, icon: Clock },
          { label: 'Unique Actors', value: new Set(logs.map(l => l.actor_email).filter(Boolean)).size, icon: User },
          { label: 'Event Types', value: eventTypes.length, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Search by actor, event type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 h-9 text-sm">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground self-center">{filtered.length} events</span>
      </div>

      {/* Log table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/20 animate-pulse mx-4 my-2 rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Activity className="h-10 w-10 opacity-30" />
              <p className="text-sm">No audit events found</p>
              {logs.length === 0 && (
                <p className="text-xs text-center max-w-xs">Audit events are recorded as the platform is used. Actions like logins, invoice generation, and data changes will appear here.</p>
              )}
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border/50">
                {filtered.map(log => (
                  <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-[10px] border', getEventColor(log.event_type))}>
                          {log.event_type}
                        </Badge>
                        {log.target_type && (
                          <span className="text-[10px] text-muted-foreground">
                            → {log.target_type}{log.target_id ? ` #${log.target_id.slice(0, 8)}` : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-foreground font-medium">{log.actor_email || 'System'}</span>
                        {log.ip_address && (
                          <span className="text-[10px] text-muted-foreground font-mono">{log.ip_address}</span>
                        )}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">
                          {JSON.stringify(log.metadata).slice(0, 120)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
