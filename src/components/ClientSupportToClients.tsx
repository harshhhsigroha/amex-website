/**
 * ClientSupportToClients
 * Tony's (Operator 2) inbox for tickets raised by his end-clients (Operator 3).
 */
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MessageCircle, Send, Ticket, Loader2, Clock,
  CheckCircle2, AlertCircle, HelpCircle, Users, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
}

interface SupportMessage {
  id: string;
  message: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export function ClientSupportToClients() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  // Resolve client_id for Tony
  const { data: clientId } = useQuery({
    queryKey: ['my_client_id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.client_id ?? null;
    },
    enabled: !!user,
  });

  // Fetch tickets raised by portal_users (end-clients) linked to Tony's client_id
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['client_support_inbox', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      // Get portal user ids for this client
      const { data: portalLinks } = await supabase
        .from('portal_users')
        .select('user_id')
        .eq('client_id', clientId);
      if (!portalLinks || portalLinks.length === 0) return [];
      const portalUserIds = portalLinks.map((l: { user_id: string }) => l.user_id);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .in('user_id', portalUserIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!clientId,
    refetchInterval: 15000,
  });

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
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim() || !user) return;
    setSendingMessage(true);
    const { error } = await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: user.id,
      message: newMessage.trim(),
      is_admin: false, // Tony is not a AMEX Outsourcing admin but acts as ops admin to his clients
    });
    if (!error) {
      setNewMessage('');
      loadMessages(selectedTicket.id);
    }
    setSendingMessage(false);
  };

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: 'open' | 'in_progress' | 'resolved' | 'closed' }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_support_inbox', clientId] });
      if (selectedTicket) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_support_inbox', clientId] });
      setTicketToDelete(null);
      if (selectedTicket?.id === ticketToDelete?.id) setSelectedTicket(null);
      toast.success('Ticket deleted');
    },
    onError: () => toast.error('Failed to delete ticket'),
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusIcon = (status: string) => {
    if (status === 'open') return <AlertCircle className="h-3 w-3" />;
    if (status === 'in_progress') return <Clock className="h-3 w-3" />;
    if (status === 'resolved' || status === 'closed') return <CheckCircle2 className="h-3 w-3" />;
    return <HelpCircle className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Client Support Inbox</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Support tickets raised by your end-clients. Reply and manage them here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Client Tickets
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <Badge variant="destructive" className="text-[10px] ml-auto">
                  {tickets.filter(t => t.status === 'open').length} open
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {tickets.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No client tickets yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Tickets raised by your clients will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="relative group">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          'w-full p-4 text-left hover:bg-muted/50 transition-colors pr-10',
                          selectedTicket?.id === ticket.id && 'bg-muted'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {ticket.ticket_number}
                          </span>
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
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => setTicketToDelete(ticket)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat */}
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={cn('gap-1 text-[10px]', statusColors[selectedTicket.status])}>
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateTicketStatus.mutate({ ticketId: selectedTicket.id, status: 'resolved' as const })}
                        disabled={updateTicketStatus.isPending}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-lg">
                  {selectedTicket.description}
                </p>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[400px]">
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Reply to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={cn('flex', msg.sender_id === user?.id ? 'justify-end' : 'justify-start')}
                        >
                          <div className={cn(
                            'max-w-[80%] rounded-xl px-4 py-2',
                            msg.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={cn(
                              'text-[10px] mt-1',
                              msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {msg.sender_id === user?.id ? 'You' : 'Client'} · {formatDate(msg.created_at)}
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
                      placeholder="Reply to client..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={selectedTicket.status === 'closed' || selectedTicket.status === 'resolved'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim() || selectedTicket.status === 'closed'}
                    >
                      {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                    <p className="text-xs text-muted-foreground mt-2">
                      This ticket is {selectedTicket.status}.
                    </p>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
              <Ticket className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">Select a ticket to view conversation</p>
              <p className="text-xs mt-1">Your clients' support requests appear on the left</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!ticketToDelete} onOpenChange={(open) => !open && setTicketToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{ticketToDelete?.ticket_number}</strong>? This will permanently remove the ticket and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => ticketToDelete && deleteTicketMutation.mutate(ticketToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
