import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, CheckCircle, AlertTriangle, XCircle, Timer } from 'lucide-react';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';

const SLA_TARGETS: Record<string, number> = {
  urgent: 1,
  high: 4,
  medium: 12,
  low: 24,
};

export function SLATrackingPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['sla_tracking'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('id, subject, status, priority, created_at, first_response_at, resolved_at, client_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return tickets || [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const tickets = data || [];
  const now = new Date();

  // Calculate SLA metrics
  const slaMetrics = {
    total: tickets.length,
    withinSla: 0,
    breached: 0,
    pending: 0,
    avgResponseMinutes: 0,
  };

  let totalResponseMinutes = 0;
  let respondedCount = 0;

  const ticketsWithSla = tickets.map(t => {
    const target = SLA_TARGETS[t.priority] || 12;
    const createdAt = new Date(t.created_at);
    const responseTime = t.first_response_at ? differenceInMinutes(new Date(t.first_response_at), createdAt) : null;
    const elapsed = differenceInHours(now, createdAt);
    const isOpen = t.status === 'open' || t.status === 'in_progress';

    let slaStatus: 'met' | 'breached' | 'pending' = 'pending';
    if (responseTime !== null) {
      slaStatus = responseTime <= target * 60 ? 'met' : 'breached';
      totalResponseMinutes += responseTime;
      respondedCount++;
    } else if (!isOpen) {
      slaStatus = 'met';
    } else if (elapsed >= target) {
      slaStatus = 'breached';
    }

    if (slaStatus === 'met') slaMetrics.withinSla++;
    else if (slaStatus === 'breached') slaMetrics.breached++;
    else slaMetrics.pending++;

    return { ...t, slaStatus, responseTime, targetHours: target };
  });

  slaMetrics.avgResponseMinutes = respondedCount > 0 ? Math.round(totalResponseMinutes / respondedCount) : 0;
  const complianceRate = slaMetrics.total > 0 ? Math.round((slaMetrics.withinSla / (slaMetrics.withinSla + slaMetrics.breached || 1)) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">SLA Tracking</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Monitor response times and SLA compliance</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{complianceRate}%</p>
                <p className="text-[10px] text-muted-foreground">SLA Compliance</p>
              </div>
            </div>
            <Progress value={complianceRate} className="h-1.5 mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{slaMetrics.avgResponseMinutes > 60 ? `${Math.round(slaMetrics.avgResponseMinutes / 60)}h` : `${slaMetrics.avgResponseMinutes}m`}</p>
                <p className="text-[10px] text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{slaMetrics.breached}</p>
                <p className="text-[10px] text-muted-foreground">SLA Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{slaMetrics.pending}</p>
                <p className="text-[10px] text-muted-foreground">Awaiting Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Targets */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <h3 className="text-sm font-semibold mb-3">SLA Targets by Priority</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(SLA_TARGETS).map(([priority, hours]) => (
              <div key={priority} className="p-3 rounded-lg bg-muted/50 text-center">
                <Badge variant="outline" className="text-[10px] capitalize mb-1">{priority}</Badge>
                <p className="text-lg font-bold text-foreground">{hours}h</p>
                <p className="text-[10px] text-muted-foreground">target</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent tickets with SLA status */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <h3 className="text-sm font-semibold mb-3">Recent Tickets — SLA Status</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ticketsWithSla.slice(0, 20).map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                {t.slaStatus === 'met' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : t.slaStatus === 'breached' ? (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{t.subject}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(t.created_at), 'dd MMM HH:mm')} — Target: {t.targetHours}h
                    {t.responseTime !== null && ` — Response: ${t.responseTime > 60 ? `${Math.round(t.responseTime / 60)}h` : `${t.responseTime}m`}`}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[9px] capitalize ${
                  t.priority === 'urgent' ? 'border-destructive/30 text-destructive' :
                  t.priority === 'high' ? 'border-amber-500/30 text-amber-600' : ''
                }`}>
                  {t.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
