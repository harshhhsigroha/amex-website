import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  LogOut, FileText, Headphones, Clock, UserCircle2, Send, Plus,
  Download, AlertCircle, CheckCircle2, HelpCircle, MapPin, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CandidateGuide } from '@/components/guides/CandidateGuide';
import type { SelfBilledInvoice } from '@/types/candidate';

interface CandidateRow {
  id: string;
  emp_id: string;
  candidate_name: string;
  email: string | null;
  contact_no: string | null;
  address: string | null;
  ni_number: string | null;
  beneficiary_name: string | null;
  account_number: string | null;
  sort_code: string | null;
  bank_name: string | null;
  hourly_rate: number | null;
}

interface TimeLog {
  id: string;
  log_date: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  clock_in_address: string | null;
  clock_out_address: string | null;
  financial_year: string;
  financial_week: number;
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
  ticket_id: string | null;
  message: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
}

const fmtMoney = (n: number) =>
  `£${Number(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user, loading, identityReady, isCandidate, candidateId, signOut } = useAuth();

  const [candidate, setCandidate] = useState<CandidateRow | null>(null);
  const [invoices, setInvoices] = useState<SelfBilledInvoice[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const [dataLoading, setDataLoading] = useState(true);

  // Redirect if not a candidate
  useEffect(() => {
    if (!loading && identityReady) {
      if (!user) navigate('/auth/candidate');
      else if (!isCandidate) {
        toast.error('This area is for candidates only.');
        signOut();
      }
    }
  }, [user, loading, identityReady, isCandidate, navigate, signOut]);

  const loadAll = useCallback(async () => {
    if (!candidateId) return;
    setDataLoading(true);
    try {
      const [candRes, invRes, logRes, ticketRes] = await Promise.all([
        supabase.from('candidates').select('id, emp_id, candidate_name, email, contact_no, address, ni_number, beneficiary_name, account_number, sort_code, bank_name, hourly_rate').eq('id', candidateId).maybeSingle(),
        supabase.from('self_billed_invoices').select('*').order('financial_year', { ascending: false }).order('financial_week', { ascending: false }),
        supabase.from('time_logs').select('id, log_date, clock_in, clock_out, total_hours, clock_in_address, clock_out_address, financial_year, financial_week').eq('candidate_id', candidateId).order('clock_in', { ascending: false }).limit(200),
        supabase.from('support_tickets').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);

      if (candRes.data) setCandidate(candRes.data as CandidateRow);
      if (invRes.data) setInvoices(invRes.data as unknown as SelfBilledInvoice[]);
      if (logRes.data) setTimeLogs(logRes.data as TimeLog[]);
      if (ticketRes.data) setTickets(ticketRes.data as SupportTicket[]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load your data');
    } finally {
      setDataLoading(false);
    }
  }, [candidateId, user]);

  useEffect(() => { if (isCandidate && candidateId) loadAll(); }, [isCandidate, candidateId, loadAll]);

  // Load messages when ticket opens
  useEffect(() => {
    if (!activeTicket) { setTicketMessages([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', activeTicket.id).order('created_at', { ascending: true });
      if (!cancelled && data) setTicketMessages(data as SupportMessage[]);
    })();

    const channel = supabase
      .channel(`candidate-ticket-${activeTicket.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${activeTicket.id}` }, (payload) => {
        setTicketMessages(prev => [...prev, payload.new as SupportMessage]);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [activeTicket]);

  const handleCreateTicket = async () => {
    if (!user || !newSubject.trim() || !newDescription.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    const { data, error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      ticket_number: 'TMP',
      subject: newSubject.trim().slice(0, 200),
      description: newDescription.trim().slice(0, 5000),
      priority: newPriority,
      status: 'open',
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success('Ticket opened');
    setNewSubject(''); setNewDescription(''); setNewPriority('medium'); setShowNewTicket(false);
    setTickets(prev => [data as SupportTicket, ...prev]);
    setActiveTicket(data as SupportTicket);
  };

  const handleSendMessage = async () => {
    if (!user || !activeTicket || !newMessage.trim()) return;
    const msg = newMessage.trim().slice(0, 4000);
    setNewMessage('');
    const { error } = await supabase.from('support_messages').insert({
      ticket_id: activeTicket.id, sender_id: user.id, message: msg, is_admin: false,
    });
    if (error) toast.error(error.message);
  };

  const handleProfileSave = async () => {
    if (!candidate) return;
    const { error } = await supabase
      .from('candidates')
      .update({
        contact_no: candidate.contact_no,
        address: candidate.address,
        beneficiary_name: candidate.beneficiary_name,
        account_number: candidate.account_number,
        sort_code: candidate.sort_code,
        bank_name: candidate.bank_name,
      })
      .eq('id', candidate.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
  };

  const downloadInvoice = async (inv: SelfBilledInvoice) => {
    try {
      const { data: f } = await supabase.from('files').select('file_path')
        .ilike('file_name', `%${inv.remittance_number}%`).limit(1).maybeSingle();
      if (f?.file_path) {
        const { data: blob } = await supabase.storage.from('files').download(f.file_path);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = inv.pdf_filename; a.click();
          URL.revokeObjectURL(url);
          return;
        }
      }
      toast.error('PDF not available — please contact AMEX');
    } catch { toast.error('Download failed'); }
  };

  if (loading || !identityReady) return <LoadingScreen />;
  if (!user || !isCandidate) return <LoadingScreen />;

  const totalEarned = invoices.reduce((s, i) => s + Number(i.total_to_pay || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <UserCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{candidate?.candidate_name || 'Candidate Portal'}</h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {candidate?.emp_id} · {user.email}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="self-bills">
          <TabsList className="grid grid-cols-5 max-w-3xl">
            <TabsTrigger value="self-bills" className="gap-2"><FileText className="h-4 w-4" />Self-Bills</TabsTrigger>
            <TabsTrigger value="time-logs" className="gap-2"><Clock className="h-4 w-4" />Time Logs</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><UserCircle2 className="h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="support" className="gap-2"><Headphones className="h-4 w-4" />Support</TabsTrigger>
            <TabsTrigger value="guide" className="gap-2"><BookOpen className="h-4 w-4" />Guide</TabsTrigger>
          </TabsList>

          {/* Self-bills */}
          <TabsContent value="self-bills" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Remittances</p>
                <p className="text-2xl font-bold mt-1">{invoices.length}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold mt-1">{fmtMoney(totalEarned)}</p>
              </CardContent></Card>
              <Card className="hidden md:block"><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Hourly Rate</p>
                <p className="text-2xl font-bold mt-1">{candidate?.hourly_rate ? fmtMoney(Number(candidate.hourly_rate)) : '—'}</p>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Your Self-Billed Invoices</CardTitle>
                <CardDescription>Sorted by UK financial year and week (most recent first)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
                ) : invoices.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No remittances yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{inv.remittance_number}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {fmtDate(inv.payment_date)} · {inv.financial_year} · Week {inv.financial_week}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-semibold text-sm">{fmtMoney(Number(inv.total_to_pay))}</span>
                          <Button size="sm" variant="outline" onClick={() => downloadInvoice(inv)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time logs */}
          <TabsContent value="time-logs" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Clock In / Out History</CardTitle>
                <CardDescription>Recent shifts (latest first)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
                ) : timeLogs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No clock-in records yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {timeLogs.map(log => (
                      <div key={log.id} className="px-5 py-3 hover:bg-muted/30">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold">{fmtDate(log.log_date)}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {fmtTime(log.clock_in)}{log.clock_out ? ` → ${fmtTime(log.clock_out)}` : ' · in progress'}
                              {' · '}{log.financial_year} W{log.financial_week}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.total_hours != null ? `${Number(log.total_hours).toFixed(2)} hrs` : '—'}
                          </Badge>
                        </div>
                        {(log.clock_in_address || log.clock_out_address) && (
                          <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                            {log.clock_in_address && <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /><span className="truncate">In: {log.clock_in_address}</span></div>}
                            {log.clock_out_address && <div className="flex items-start gap-1.5"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /><span className="truncate">Out: {log.clock_out_address}</span></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">My Profile</CardTitle>
                <CardDescription>Update your contact and bank details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!candidate ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Employee ID</Label>
                        <Input value={candidate.emp_id} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Full Name</Label>
                        <Input value={candidate.candidate_name} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email (on file)</Label>
                        <Input value={candidate.email || ''} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Contact Number</Label>
                        <Input value={candidate.contact_no || ''} onChange={e => setCandidate({ ...candidate, contact_no: e.target.value })} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <Label>Address</Label>
                        <Textarea rows={2} value={candidate.address || ''} onChange={e => setCandidate({ ...candidate, address: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>NI Number</Label>
                        <Input value={candidate.ni_number || ''} disabled />
                        <p className="text-[10px] text-muted-foreground">To change, please contact AMEX.</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <h3 className="text-sm font-semibold mb-3">Bank Details</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Beneficiary Name</Label>
                          <Input value={candidate.beneficiary_name || ''} onChange={e => setCandidate({ ...candidate, beneficiary_name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Bank Name</Label>
                          <Input value={candidate.bank_name || ''} onChange={e => setCandidate({ ...candidate, bank_name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Account Number</Label>
                          <Input value={candidate.account_number || ''} onChange={e => setCandidate({ ...candidate, account_number: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Sort Code</Label>
                          <Input value={candidate.sort_code || ''} onChange={e => setCandidate({ ...candidate, sort_code: e.target.value })} placeholder="XX-XX-XX" />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleProfileSave}>Save changes</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support" className="mt-6">
            <div className="grid md:grid-cols-[300px_1fr] gap-4">
              {/* Ticket list */}
              <Card className="md:max-h-[600px] flex flex-col">
                <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm">Your Tickets</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { setShowNewTicket(true); setActiveTicket(null); }}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                  {tickets.length === 0 ? (
                    <p className="p-4 text-xs text-muted-foreground text-center">No tickets yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {tickets.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setActiveTicket(t); setShowNewTicket(false); }}
                          className={cn('w-full text-left px-4 py-3 hover:bg-muted/40 transition', activeTicket?.id === t.id && 'bg-muted/60')}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-mono text-muted-foreground">{t.ticket_number}</p>
                            <Badge variant="outline" className={cn('text-[10px]', statusColors[t.status])}>{t.status}</Badge>
                          </div>
                          <p className="text-sm font-medium mt-1 line-clamp-1">{t.subject}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(t.created_at)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right panel */}
              <Card className="md:max-h-[600px] flex flex-col">
                {showNewTicket ? (
                  <>
                    <CardHeader><CardTitle className="text-base">New Ticket</CardTitle></CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <Label>Subject</Label>
                        <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} maxLength={200} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Priority</Label>
                        <Select value={newPriority} onValueChange={(v) => setNewPriority(v as typeof newPriority)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea rows={5} value={newDescription} onChange={e => setNewDescription(e.target.value)} maxLength={5000} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateTicket}>Open Ticket</Button>
                        <Button variant="ghost" onClick={() => setShowNewTicket(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </>
                ) : activeTicket ? (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{activeTicket.subject}</CardTitle>
                          <CardDescription className="text-xs font-mono">{activeTicket.ticket_number}</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px]', statusColors[activeTicket.status])}>{activeTicket.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
                      <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="space-y-3 py-2">
                          <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-[10px] text-muted-foreground mb-1">{fmtDate(activeTicket.created_at)} · You</p>
                            <p className="text-sm whitespace-pre-wrap">{activeTicket.description}</p>
                          </div>
                          {ticketMessages.map(m => (
                            <div key={m.id} className={cn('rounded-lg p-3 max-w-[85%]', m.is_admin ? 'bg-primary/10 mr-auto' : 'bg-muted/40 ml-auto')}>
                              <p className="text-[10px] text-muted-foreground mb-1">
                                {fmtDate(m.created_at)} · {m.is_admin ? 'AMEX Team' : 'You'}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2 border-t border-border pt-3">
                        <Input
                          placeholder="Type a message…"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                          maxLength={4000}
                        />
                        <Button onClick={handleSendMessage} size="icon"><Send className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center text-center p-8">
                    <div className="space-y-2 text-muted-foreground">
                      <HelpCircle className="h-10 w-10 mx-auto opacity-30" />
                      <p className="text-sm">Select a ticket or open a new one</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Powered by Oak Technologies
      </footer>
    </div>
  );
}
