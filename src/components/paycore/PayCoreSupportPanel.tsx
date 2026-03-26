import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MessageSquare, Send, Clock, CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-600 border-blue-200',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-200',
  resolved: 'bg-green-500/10 text-green-600 border-green-200',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-600',
  high: 'bg-amber-500/10 text-amber-600',
  urgent: 'bg-red-500/10 text-red-600',
};

export function PayCoreSupportPanel() {
  const { user } = useAuth();
  const { clients } = useClients();
  const qc = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tickets = [] } = useQuery({
    queryKey: ['all_support_tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['support_messages', selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicket)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTicket,
    refetchInterval: 5000,
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!reply.trim() || !selectedTicket || !user) return;
      const { error } = await supabase.from('support_messages').insert({
        ticket_id: selectedTicket,
        sender_id: user.id,
        message: reply.trim(),
        is_admin: true,
        is_read: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['support_messages', selectedTicket] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('support_tickets').update({
        status: status as 'open' | 'in_progress' | 'resolved' | 'closed',
        ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all_support_tickets'] });
      toast.success('Status updated');
    },
  });

  const filtered = (tickets as any[]).filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected = (tickets as any[]).find((t: any) => t.id === selectedTicket);
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.company_name]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Ticket List */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input className="pl-7 h-8 text-xs" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1 border border-border/60 rounded-lg">
          <div className="p-2 space-y-1">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No tickets found</p>
            )}
            {filtered.map((ticket: any) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedTicket === ticket.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{ticket.subject}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ticket.ticket_number}
                      {ticket.client_id && clientMap[ticket.client_id] ? ` · ${clientMap[ticket.client_id]}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={`text-[9px] ${statusColors[ticket.status] || ''}`}>{ticket.status.replace('_', ' ')}</Badge>
                    <Badge className={`text-[9px] ${priorityColors[ticket.priority] || ''}`}>{ticket.priority}</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(ticket.created_at).toLocaleDateString('en-GB')}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-3 flex flex-col border border-border/60 rounded-lg overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p>Select a ticket to view the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-border/60 p-4 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{selected.subject}</h3>
                  <p className="text-xs text-muted-foreground">{selected.ticket_number} · {selected.client_id && clientMap[selected.client_id] ? clientMap[selected.client_id] : 'Unknown client'}</p>
                </div>
                <Select value={selected.status} onValueChange={status => updateStatus.mutate({ id: selected.id, status })}>
                  <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{selected.description}</p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {(messages as any[]).map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                      msg.is_admin
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_admin ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-8">No messages yet</p>
                )}
              </div>
            </ScrollArea>

            {/* Reply Box */}
            <div className="border-t border-border/60 p-3 bg-card">
              <div className="flex gap-2">
                <Textarea
                  className="text-xs min-h-[64px] resize-none"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      sendReply.mutate();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="self-end"
                  onClick={() => sendReply.mutate()}
                  disabled={!reply.trim() || sendReply.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Cmd+Enter to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
