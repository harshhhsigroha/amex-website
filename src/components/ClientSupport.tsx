import { useState, useEffect, useRef } from 'react';
import { useSupportTickets, SupportTicket, SupportMessage } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle,
  Plus,
  Send,
  Ticket,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type TicketPriority = Database['public']['Enums']['ticket_priority'];

const statusColors = {
  open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

export function ClientSupport() {
  const { user } = useAuth();
  const {
    tickets,
    isLoading,
    createTicket,
    deleteTicket,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToMessages,
  } = useSupportTickets();

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<TicketPriority>('medium');
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      markMessagesAsRead(selectedTicket.id);
      
      const unsubscribe = subscribeToMessages(selectedTicket.id, (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_id !== user?.id) {
          markMessagesAsRead(selectedTicket.id);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedTicket?.id]);

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const msgs = await getMessages(ticketId);
    setMessages(msgs);
    setLoadingMessages(false);
  };

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) return;

    setCreatingTicket(true);
    const ticket = await createTicket(newTicketSubject, newTicketDescription, newTicketPriority);
    if (ticket) {
      setNewTicketSubject('');
      setNewTicketDescription('');
      setNewTicketPriority('medium');
      setIsCreateDialogOpen(false);
    }
    setCreatingTicket(false);
  };

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    const ok = await deleteTicket(ticket.id);
    if (ok) {
      setTicketToDelete(null);
      if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
    }
  };


  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);
    await sendMessage(selectedTicket.id, newMessage);
    setNewMessage('');
    setSendingMessage(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-3 w-3" />;
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <HelpCircle className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
          <p className="text-muted-foreground text-sm">Get help with your account and services</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicketPriority} onValueChange={(v) => setNewTicketPriority(v as TicketPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={creatingTicket || !newTicketSubject.trim() || !newTicketDescription.trim()}
                className="w-full"
              >
                {creatingTicket ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Ticket className="h-4 w-4 mr-2" />
                )}
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Ticket className="h-4 w-4" />
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {tickets.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground text-sm">No tickets yet</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">Create a ticket to get support</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="relative group">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className={cn(
                          'w-full p-4 text-left hover:bg-muted/50 transition-colors pr-10',
                          selectedTicket?.id === ticket.id && 'bg-muted'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
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

        {/* Chat / Ticket Details */}
        <Card className="lg:col-span-2 border-border/50">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedTicket.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTicket.ticket_number} • Created {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('gap-1', statusColors[selectedTicket.status])}>
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
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start a conversation with support</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-xl px-4 py-2',
                              msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={cn(
                                'text-[10px] mt-1',
                                msg.sender_id === user?.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {msg.is_admin ? 'Support' : 'You'} • {formatDate(msg.created_at)}
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
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={selectedTicket.status === 'closed'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim() || selectedTicket.status === 'closed'}
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {selectedTicket.status === 'closed' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      This ticket is closed. Create a new ticket if you need further assistance.
                    </p>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">Select a ticket to view conversation</p>
              <p className="text-xs mt-1">Or create a new ticket for support</p>
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
              onClick={() => ticketToDelete && handleDeleteTicket(ticketToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
