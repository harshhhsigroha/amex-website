import { useState, useEffect, useRef } from 'react';
import { useSupportTickets, SupportTicket, SupportMessage } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  MessageCircle,
  Send,
  Ticket,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  User,
  Building2,
  Radio,
  Circle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type TicketStatus = Database['public']['Enums']['ticket_status'];

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

// Check if current time is within working hours (9 AM - 6 PM, Mon-Fri)
const isWithinWorkingHours = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
};

export function AdminSupport() {
  const { user } = useAuth();
  const {
    tickets,
    isLoading,
    updateTicketStatus,
    deleteTicket,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToMessages,
    refreshTickets,
  } = useSupportTickets();

  const [activeTab, setActiveTab] = useState<'tickets' | 'livechat'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [liveChatTicket, setLiveChatTicket] = useState<SupportTicket | null>(null);
  const [liveChatMessages, setLiveChatMessages] = useState<SupportMessage[]>([]);
  const [liveChatNewMessage, setLiveChatNewMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveChatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollLiveChatToBottom = () => {
    liveChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollLiveChatToBottom();
  }, [liveChatMessages]);

  // Get active tickets for live chat (open or in_progress)
  const activeChats = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  );

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

  useEffect(() => {
    if (liveChatTicket) {
      loadLiveChatMessages(liveChatTicket.id);
      markMessagesAsRead(liveChatTicket.id);

      const unsubscribe = subscribeToMessages(liveChatTicket.id, (newMsg) => {
        setLiveChatMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_id !== user?.id) {
          markMessagesAsRead(liveChatTicket.id);
        }
      });

      return () => unsubscribe();
    }
  }, [liveChatTicket?.id]);

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const msgs = await getMessages(ticketId);
    setMessages(msgs);
    setLoadingMessages(false);
  };

  const loadLiveChatMessages = async (ticketId: string) => {
    const msgs = await getMessages(ticketId);
    setLiveChatMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);
    await sendMessage(selectedTicket.id, newMessage);
    setNewMessage('');
    setSendingMessage(false);

    if (selectedTicket.status === 'open') {
      await updateTicketStatus(selectedTicket.id, 'in_progress');
      setSelectedTicket({ ...selectedTicket, status: 'in_progress' });
    }
  };

  const handleLiveChatSend = async () => {
    if (!liveChatTicket || !liveChatNewMessage.trim()) return;

    setSendingMessage(true);
    await sendMessage(liveChatTicket.id, liveChatNewMessage);
    setLiveChatNewMessage('');
    setSendingMessage(false);

    if (liveChatTicket.status === 'open') {
      await updateTicketStatus(liveChatTicket.id, 'in_progress');
      setLiveChatTicket({ ...liveChatTicket, status: 'in_progress' });
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    await updateTicketStatus(selectedTicket.id, status);
    setSelectedTicket({ ...selectedTicket, status });
  };

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    const ok = await deleteTicket(ticket.id);
    if (ok) {
      setTicketToDelete(null);
      setIsDialogOpen(false);
      setSelectedTicket(null);
    }
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

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  const workingHours = isWithinWorkingHours();

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
          <h2 className="text-2xl font-bold text-foreground">Support Management</h2>
          <p className="text-muted-foreground text-sm">Manage and respond to client support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          {workingHours ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
              <Circle className="h-2 w-2 fill-current" />
              Live Chat Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
              <Circle className="h-2 w-2" />
              Outside Working Hours
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tickets' | 'livechat')}>
        <TabsList className="mb-4">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
            {stats.open > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {stats.open}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="livechat" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Chat
            {activeChats.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-green-500/20 text-green-600">
                {activeChats.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Ticket</TableHead>
                      <TableHead className="font-semibold">User / Client</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No tickets found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => handleSelectTicket(ticket)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-mono text-xs text-muted-foreground mb-1">
                                {ticket.ticket_number}
                              </p>
                              <p className="font-medium text-sm truncate max-w-[250px]">{ticket.subject}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {ticket.user_email || 'Unknown'}
                              </span>
                              {ticket.client_name && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  {ticket.client_name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('gap-1', statusColors[ticket.status])}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={priorityColors[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(ticket.created_at)}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setTicketToDelete(ticket)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Chat Tab */}
        <TabsContent value="livechat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Active Chats List */}
            <Card className="lg:col-span-1 border-border/50 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Active Chats
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  {activeChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                      <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No active chats</p>
                      <p className="text-xs">Waiting for client messages</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {activeChats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setLiveChatTicket(chat)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg transition-colors',
                            liveChatTicket?.id === chat.id
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{chat.user_email}</p>
                              {chat.client_name && (
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {chat.client_name}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {chat.subject}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className={cn('text-[10px] px-1.5', statusColors[chat.status])}>
                                {chat.status === 'open' ? 'New' : 'Active'}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTime(chat.created_at)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 border-border/50 flex flex-col">
              {liveChatTicket ? (
                <>
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{liveChatTicket.user_email}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {liveChatTicket.client_name && `${liveChatTicket.client_name} • `}
                          {liveChatTicket.subject}
                        </p>
                      </div>
                      <Select 
                        value={liveChatTicket.status} 
                        onValueChange={async (v) => {
                          await updateTicketStatus(liveChatTicket.id, v as TicketStatus);
                          setLiveChatTicket({ ...liveChatTicket, status: v as TicketStatus });
                        }}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      {liveChatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {liveChatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                'flex',
                                msg.is_admin ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div
                                className={cn(
                                  'max-w-[75%] rounded-xl px-4 py-2',
                                  msg.is_admin
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                              >
                                <p className="text-sm">{msg.message}</p>
                                <p
                                  className={cn(
                                    'text-[10px] mt-1',
                                    msg.is_admin
                                      ? 'text-primary-foreground/70'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={liveChatEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={liveChatNewMessage}
                          onChange={(e) => setLiveChatNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleLiveChatSend()}
                          disabled={liveChatTicket.status === 'closed'}
                        />
                        <Button
                          onClick={handleLiveChatSend}
                          disabled={sendingMessage || !liveChatNewMessage.trim() || liveChatTicket.status === 'closed'}
                        >
                          {sendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <Radio className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a chat</p>
                  <p className="text-sm">Choose an active conversation from the left</p>
                  {!workingHours && (
                    <Badge variant="outline" className="mt-4 bg-muted">
                      Live chat available Mon-Fri, 9 AM - 6 PM
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
          {selectedTicket && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-lg">{selectedTicket.subject}</DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {selectedTicket.ticket_number}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {selectedTicket.user_email}
                      </span>
                      {selectedTicket.client_name && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {selectedTicket.client_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedTicket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setTicketToDelete(selectedTicket)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  {selectedTicket.description}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Send a response to the client</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            msg.is_admin ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-xl px-4 py-2',
                              msg.is_admin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={cn(
                                'text-[10px] mt-1',
                                msg.is_admin
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {msg.is_admin ? 'You (Admin)' : msg.sender_email} • {formatDate(msg.created_at)}
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
                      placeholder="Type your response..."
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
                      This ticket is closed. Change status to respond.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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