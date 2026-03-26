import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, MessageSquare, Users, Shield, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';

interface TimelineEvent {
  id: string;
  type: 'invoice' | 'ticket' | 'user_added' | 'audit';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

export function ClientActivityTimeline() {
  const { clients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['client_activity_timeline', selectedClientId],
    queryFn: async () => {
      const timeline: TimelineEvent[] = [];

      // Fetch invoices
      let invoiceQ = supabase.from('invoices').select('id, invoice_number, created_at, client_id, grand_total').order('created_at', { ascending: false }).limit(20);
      if (selectedClientId !== 'all') invoiceQ = invoiceQ.eq('client_id', selectedClientId);
      const { data: invoices } = await invoiceQ;
      invoices?.forEach(inv => {
        const clientName = clients.find(c => c.id === inv.client_id)?.company_name || 'Unknown';
        timeline.push({
          id: `inv-${inv.id}`,
          type: 'invoice',
          title: `Invoice ${inv.invoice_number} generated`,
          description: `${clientName} — £${Number(inv.grand_total).toFixed(2)}`,
          timestamp: inv.created_at,
          icon: FileText,
          color: 'text-emerald-500',
        });
      });

      // Fetch tickets
      let ticketQ = supabase.from('support_tickets').select('id, subject, created_at, status, priority, client_id').order('created_at', { ascending: false }).limit(20);
      if (selectedClientId !== 'all') ticketQ = ticketQ.eq('client_id', selectedClientId);
      const { data: tickets } = await ticketQ;
      tickets?.forEach(t => {
        const clientName = clients.find(c => c.id === t.client_id)?.company_name || 'Direct';
        timeline.push({
          id: `tkt-${t.id}`,
          type: 'ticket',
          title: `Ticket: ${t.subject}`,
          description: `${clientName} — ${t.priority} priority`,
          timestamp: t.created_at,
          icon: MessageSquare,
          color: t.priority === 'urgent' ? 'text-destructive' : t.priority === 'high' ? 'text-amber-500' : 'text-blue-500',
        });
      });

      // Fetch recent client_users additions
      let userQ = supabase.from('client_users').select('id, created_at, client_id').order('created_at', { ascending: false }).limit(15);
      if (selectedClientId !== 'all') userQ = userQ.eq('client_id', selectedClientId);
      const { data: users } = await userQ;
      users?.forEach(u => {
        const clientName = clients.find(c => c.id === u.client_id)?.company_name || 'Unknown';
        timeline.push({
          id: `usr-${u.id}`,
          type: 'user_added',
          title: 'New user linked',
          description: clientName,
          timestamp: u.created_at,
          icon: Users,
          color: 'text-purple-500',
        });
      });

      // Fetch audit logs
      const { data: audits } = await supabase.from('audit_log').select('id, event_type, actor_email, created_at, target_type').order('created_at', { ascending: false }).limit(20);
      audits?.forEach(a => {
        timeline.push({
          id: `aud-${a.id}`,
          type: 'audit',
          title: a.event_type.replace(/_/g, ' '),
          description: `${a.actor_email || 'System'} — ${a.target_type || ''}`,
          timestamp: a.created_at,
          icon: Shield,
          color: 'text-muted-foreground',
        });
      });

      // Sort all by timestamp descending
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return timeline.slice(0, 50);
    },
    enabled: clients.length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Activity Timeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Recent platform activity across all clients</p>
        </div>
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No activity found</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-0">
            {events.map((event, i) => {
              const Icon = event.icon;
              const showDate = i === 0 || format(new Date(event.timestamp), 'yyyy-MM-dd') !== format(new Date(events[i - 1].timestamp), 'yyyy-MM-dd');
              return (
                <div key={event.id}>
                  {showDate && (
                    <div className="relative pl-10 py-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {format(new Date(event.timestamp), 'EEEE, dd MMM yyyy')}
                      </p>
                    </div>
                  )}
                  <div className="relative pl-10 py-2 group hover:bg-muted/30 rounded-lg transition-colors">
                    <div className={`absolute left-2 top-3.5 h-5 w-5 rounded-full bg-background border-2 border-border flex items-center justify-center`}>
                      <Icon className={`h-2.5 w-2.5 ${event.color}`} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(event.timestamp), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
