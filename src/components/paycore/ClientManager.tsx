import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClients } from '@/hooks/useClients';
import { useClientPlans, useClientBilling, useClientWhiteLabel } from '@/hooks/usePayCoreClients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Building2, CreditCard, Palette, Users, MapPin, Loader2,
  Plus, Edit2, CheckCircle2, XCircle, FileText, UserPlus,
  Trash2, ShieldCheck, Globe, TrendingUp, Search, Key, Eye, EyeOff,
  Users2, Layers, Copy
} from 'lucide-react';
import { DbClient } from '@/types/database';
import { ClientPlan, ClientBillingRecord } from '@/hooks/usePayCoreClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Colours ───────────────────────────────────────────────────────────────────

const planColor = (tier: string) => ({
  volume_starter: 'bg-blue-500/10 text-blue-600 border-blue-200',
  volume_pro: 'bg-violet-500/10 text-violet-600 border-violet-200',
  volume_enterprise: 'bg-amber-500/10 text-amber-600 border-amber-200',
  team: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
}[tier] ?? 'bg-muted text-muted-foreground');

const statusColor = (s: string) => ({
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  trial: 'bg-blue-500/10 text-blue-600 border-blue-200',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
}[s] ?? 'bg-muted text-muted-foreground');

// ── Pricing Logic (matches landing page) ──────────────────────────────────────

export interface PricingPlan {
  id: string;
  label: string;
  description: string;
  type: 'volume' | 'team';
  candidateLimit: number | null; // null = unlimited
  monthlyFee: (candidateCount?: number) => number;
  setupFee: (candidateCount?: number) => number;
  perCandidate: number | null;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'volume_starter',
    label: 'Volume – Starter',
    description: 'Up to 200 candidates',
    type: 'volume',
    candidateLimit: 200,
    monthlyFee: (n = 100) => Math.min(n, 200) * 5,
    setupFee: () => 750,
    perCandidate: 5,
    features: ['Up to 200 candidates', 'Invoice generation', 'Self-billed invoices', 'Candidate management', '£750 setup fee'],
  },
  {
    id: 'volume_pro',
    label: 'Volume – Pro',
    description: '201–1,000 candidates',
    type: 'volume',
    candidateLimit: 1000,
    monthlyFee: (n = 400) => Math.min(n, 1000) * 4,
    setupFee: () => 500,
    perCandidate: 4,
    features: ['201–1,000 candidates', 'All Starter features', 'Priority support', '£500 setup fee'],
  },
  {
    id: 'volume_enterprise',
    label: 'Volume – Enterprise',
    description: '1,001+ candidates',
    type: 'volume',
    candidateLimit: null,
    monthlyFee: (n = 1500) => n * 3,
    setupFee: () => 0,
    perCandidate: 3,
    features: ['1,000+ candidates', 'All Pro features', 'Dedicated support', 'Free setup'],
  },
  {
    id: 'team',
    label: 'Team Plan',
    description: 'Up to 100 users',
    type: 'team',
    candidateLimit: null,
    monthlyFee: () => 499,
    setupFee: () => 2000,
    perCandidate: null,
    features: ['Up to 100 users', 'Fixed monthly fee', 'All features included', '£2,000 setup fee'],
  },
];

function calcMonthlyFee(planId: string, candidateCount: number): number {
  const plan = PRICING_PLANS.find(p => p.id === planId);
  return plan ? plan.monthlyFee(candidateCount) : 0;
}

// ── Add Client Dialog ─────────────────────────────────────────────────────────

const EMPTY = { company_name: '', address_line_1: '', address_line_2: '', city: '', postcode: '', country: 'United Kingdom' };

function AddClientDialog({ onAdded }: { onAdded: () => void }) {
  const { addClient } = useClients();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.company_name || !form.address_line_1 || !form.city || !form.postcode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const result = await addClient({ ...form, address_line_2: form.address_line_2 || null });
    setSaving(false);
    if (result.success) { setOpen(false); setForm(EMPTY); onAdded(); }
  };

  return (
    <>
      <Button size="sm" className="gap-2 shrink-0" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />Add Client
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Register a new PayCore client (recruitment agency).</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { key: 'company_name', label: 'Company Name *', span: 2, placeholder: 'Acme Recruitment Ltd' },
              { key: 'address_line_1', label: 'Address Line 1 *', span: 2, placeholder: '123 High Street' },
              { key: 'address_line_2', label: 'Address Line 2', span: 2, placeholder: 'Suite 4' },
              { key: 'city', label: 'City *', span: 1, placeholder: 'London' },
              { key: 'postcode', label: 'Postcode *', span: 1, placeholder: 'EC1A 1BB' },
              { key: 'country', label: 'Country *', span: 2, placeholder: 'United Kingdom' },
            ].map(({ key, label, span, placeholder }) => (
              <div key={key} className={`${span === 2 ? 'col-span-2' : ''} space-y-1`}>
                <Label className="text-xs">{label}</Label>
                <Input className="h-8 text-sm" placeholder={placeholder} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</p>;
}

// ── Plan Panel ────────────────────────────────────────────────────────────────

function PlanPanel({ client }: { client: DbClient }) {
  const { plans, upsertPlan } = useClientPlans(client.id);
  const plan = plans[0];
  const [editing, setEditing] = useState(!plan);

  const [selectedPlanId, setSelectedPlanId] = useState(plan?.plan_tier || 'volume_starter');
  const [candidateCount, setCandidateCount] = useState(plan?.notes ? parseInt(plan.notes.match(/candidates:(\d+)/)?.[1] || '100') : 100);
  const [status, setStatus] = useState(plan?.status || 'active');
  const [billingCycle, setBillingCycle] = useState(plan?.billing_cycle || 'monthly');
  const [extraNotes, setExtraNotes] = useState(plan?.notes?.replace(/candidates:\d+\s*/g, '') || '');

  const pricingPlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[0];
  const computedFee = billingCycle === 'annual'
    ? pricingPlan.monthlyFee(candidateCount) * 12 * 0.9 // 10% annual discount
    : pricingPlan.monthlyFee(candidateCount);
  const setupFee = pricingPlan.setupFee(candidateCount);

  const handleSave = () => {
    const notes = `candidates:${candidateCount} ${extraNotes}`.trim();
    upsertPlan({
      id: plan?.id,
      client_id: client.id,
      plan_tier: selectedPlanId,
      plan_name: pricingPlan.label,
      monthly_fee: computedFee,
      billing_cycle: billingCycle,
      status,
      notes,
    });
    setEditing(false);
  };

  // Display mode
  if (!editing && plan) {
    const dp = PRICING_PLANS.find(p => p.id === plan.plan_tier);
    const candidatesFromNotes = parseInt(plan.notes?.match(/candidates:(\d+)/)?.[1] || '0');
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Badge className={planColor(plan.plan_tier)}>{plan.plan_name}</Badge>
            <Badge className={statusColor(plan.status)}>{plan.status}</Badge>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setEditing(true)}>
            <Edit2 className="h-3 w-3" />Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Monthly Fee</p>
            <p className="text-sm font-bold">£{plan.monthly_fee.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{plan.billing_cycle}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Candidate Limit</p>
            <p className="text-sm font-bold">{dp?.candidateLimit?.toLocaleString() ?? 'Unlimited'}</p>
            {candidatesFromNotes > 0 && <p className="text-[10px] text-muted-foreground">{candidatesFromNotes} contracted</p>}
          </div>
          {dp?.perCandidate && (
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Rate</p>
              <p className="text-sm font-bold">£{dp.perCandidate}/candidate</p>
            </div>
          )}
        </div>

        {/* Features */}
        {dp && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Included</p>
            <div className="grid grid-cols-1 gap-1">
              {dp.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.notes && (
          <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
            {plan.notes.replace(/candidates:\d+\s*/g, '') || null}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plan Type Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Pricing Plan</Label>
        <div className="grid grid-cols-1 gap-2">
          {PRICING_PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedPlanId === p.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 hover:border-border hover:bg-muted/30'
              }`}
            >
              <div className={`h-4 w-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selectedPlanId === p.id ? 'border-primary' : 'border-muted-foreground/40'}`}>
                {selectedPlanId === p.id && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{p.label}</p>
                  <Badge variant="outline" className="text-[9px] shrink-0">
                    {p.type === 'team' ? '£499/mo' : `£${p.perCandidate}/candidate`}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Count (volume plans only) */}
      {pricingPlan.type === 'volume' && (
        <div className="space-y-1">
          <Label className="text-xs">Number of Candidates</Label>
          <div className="flex gap-2 items-center">
            <Input
              className="h-8 text-xs"
              type="number"
              min="1"
              max={pricingPlan.candidateLimit || 9999}
              value={candidateCount}
              onChange={e => setCandidateCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
            {pricingPlan.candidateLimit && (
              <span className="text-[10px] text-muted-foreground shrink-0">max {pricingPlan.candidateLimit.toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Auto-calculated fee preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Fee Preview</p>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Monthly fee</span>
          <span className="font-bold">£{pricingPlan.monthlyFee(candidateCount).toLocaleString()}</span>
        </div>
        {billingCycle === 'annual' && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Annual (10% off)</span>
            <span className="font-bold text-emerald-600">£{computedFee.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">One-time setup</span>
          <span className="font-medium">{setupFee === 0 ? 'Free' : `£${setupFee.toLocaleString()}`}</span>
        </div>
        {pricingPlan.candidateLimit && (
          <div className="flex justify-between text-xs border-t border-primary/20 pt-1.5 mt-1">
            <span className="text-muted-foreground">Candidate limit</span>
            <span className="font-semibold">{pricingPlan.candidateLimit.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Billing Cycle</Label>
          <Select value={billingCycle} onValueChange={setBillingCycle}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annual">Annual (10% off)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Internal Notes</Label>
        <Textarea className="text-xs min-h-[60px]" value={extraNotes} onChange={e => setExtraNotes(e.target.value)} placeholder="Any notes..." />
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="text-xs" onClick={handleSave}>Save Plan</Button>
        {plan && <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>}
      </div>
    </div>
  );
}

// ── Billing Panel ─────────────────────────────────────────────────────────────

function BillingPanel({ client }: { client: DbClient }) {
  const { records, addRecord, updateRecord } = useClientBilling(client.id);
  const { plans } = useClientPlans(client.id);
  const [showAdd, setShowAdd] = useState(false);
  const [showAutoGen, setShowAutoGen] = useState(false);
  const [nr, setNr] = useState({ invoice_number: '', amount: '', due_date: '', description: '', status: 'pending' });
  const [autoGen, setAutoGen] = useState({ month: new Date().toISOString().slice(0,7), type: 'monthly' });

  // Real candidate count for this specific client (via client_users → candidates agency field)
  // We count all candidates — in the future this can be scoped per-client via agency field
  const { data: realCandidateCount = 0 } = useQuery({
    queryKey: ['real_candidate_count', client.id],
    queryFn: async () => {
      // Count client_users rows to get associated users for this client, then
      // Use a proxy: count total candidates as floor estimate. 
      // True multi-tenant count would require agency scoping on candidates table.
      const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('agency', client.company_name);
      return count || 0;
    },
  });

  const plan = plans[0];
  const planDef = plan ? PRICING_PLANS.find(p => p.id === plan.plan_tier) : null;
  const contractedCandidates = plan?.notes ? parseInt(plan.notes.match(/candidates:(\d+)/)?.[1] || '0') : 0;
  const billedCandidates = contractedCandidates || realCandidateCount;
  const autoFee = planDef ? planDef.monthlyFee(billedCandidates) : 0;

  const handleAdd = () => {
    if (!nr.invoice_number || !nr.amount || !nr.due_date) return;
    addRecord({ client_id: client.id, invoice_number: nr.invoice_number, amount: parseFloat(nr.amount), due_date: nr.due_date, description: nr.description || null, status: nr.status, paid_at: null });
    setShowAdd(false);
    setNr({ invoice_number: '', amount: '', due_date: '', description: '', status: 'pending' });
  };

  const handleAutoGenerate = () => {
    const date = new Date(autoGen.month + '-01');
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDate = new Date(date.getFullYear(), date.getMonth() + 1, 15).toISOString().split('T')[0];
    const invNum = `PC-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}-${client.company_name.slice(0,3).toUpperCase()}`;
    addRecord({
      client_id: client.id,
      invoice_number: invNum,
      amount: autoFee,
      due_date: dueDate,
      description: `${planDef?.label || 'Platform'} fee – ${monthName} (${billedCandidates} candidates @ £${planDef?.perCandidate || 0}/candidate)`,
      status: 'pending',
      paid_at: null,
    });
    setShowAutoGen(false);
    toast.success('Billing invoice generated', { description: `£${autoFee.toLocaleString()} due ${dueDate}` });
  };

  const totalPending = records.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      {/* Auto-billing stats from plan */}
      {plan && planDef && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Volume Billing</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Candidates</p>
              <p className="text-sm font-bold">{billedCandidates}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Rate</p>
              <p className="text-sm font-bold">{planDef.perCandidate ? `£${planDef.perCandidate}/head` : 'Fixed'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Monthly Due</p>
              <p className="text-sm font-bold text-primary">£{autoFee.toLocaleString()}</p>
            </div>
          </div>
          <Button size="sm" className="w-full text-xs h-7 gap-1" onClick={() => setShowAutoGen(v => !v)}>
            <FileText className="h-3 w-3" />Generate Monthly Invoice
          </Button>
          {showAutoGen && (
            <div className="border border-border rounded-lg p-3 space-y-2 bg-background mt-1">
              <p className="text-[10px] font-medium">Auto-generate billing invoice</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Billing Month</Label>
                  <Input className="h-7 text-xs" type="month" value={autoGen.month} onChange={e => setAutoGen(f => ({ ...f, month: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount (auto)</Label>
                  <Input readOnly value={`£${autoFee.toLocaleString()}`} className="h-7 text-xs bg-muted/50" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {billedCandidates} candidates × £{planDef?.perCandidate || 0} = £{autoFee.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="text-xs h-7" onClick={handleAutoGenerate}>Create Invoice</Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowAutoGen(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded-lg p-3 border border-border/60">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Pending</p>
          <p className="text-lg font-bold text-foreground">£{totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <p className="text-[10px] text-primary/80 uppercase tracking-wide mb-1">Collected</p>
          <p className="text-lg font-bold text-primary">£{totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{records.length} records</span>
        <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => setShowAdd(v => !v)}>
          <Plus className="h-3 w-3" />Manual Invoice
        </Button>
      </div>

      {showAdd && (
        <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-xs">Invoice #</Label><Input className="h-7 text-xs" value={nr.invoice_number} onChange={e => setNr(f => ({ ...f, invoice_number: e.target.value }))} placeholder="PC-2024-001" /></div>
            <div className="space-y-1"><Label className="text-xs">Amount (£)</Label><Input className="h-7 text-xs" type="number" value={nr.amount} onChange={e => setNr(f => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">Due Date</Label><Input className="h-7 text-xs" type="date" value={nr.due_date} onChange={e => setNr(f => ({ ...f, due_date: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={nr.status} onValueChange={v => setNr(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input className="h-7 text-xs" value={nr.description} onChange={e => setNr(f => ({ ...f, description: e.target.value }))} placeholder="Description..." />
          <div className="flex gap-2">
            <Button size="sm" className="text-xs h-7" onClick={handleAdd}>Add</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {records.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No billing records yet</p>}
        {records.map(r => (
          <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border/60 bg-background text-xs">
            <div>
              <p className="font-medium">{r.invoice_number}</p>
              <p className="text-muted-foreground">{r.description && <span className="truncate max-w-[160px] block">{r.description}</span>}Due {r.due_date}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">£{r.amount.toFixed(2)}</span>
              <Badge className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
              {r.status !== 'paid' && (
                <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1 text-primary hover:text-primary/80" onClick={() => updateRecord({ id: r.id, status: 'paid', paid_at: new Date().toISOString() })}>
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── White Label Panel ─────────────────────────────────────────────────────────

function WhiteLabelPanel({ client }: { client: DbClient }) {
  const { whiteLabel, saveWhiteLabel } = useClientWhiteLabel(client.id);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [domainStep, setDomainStep] = useState<'idle' | 'instructions' | 'saved'>('idle');
  const [form, setForm] = useState({
    enabled: false,
    brand_name: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    custom_domain: '',
    logo_url: '',
    hide_powered_by: false,
  });

  useEffect(() => {
    if (whiteLabel) {
      setForm({
        enabled: whiteLabel.enabled ?? false,
        brand_name: whiteLabel.brand_name || '',
        primary_color: whiteLabel.primary_color || '#6366f1',
        secondary_color: whiteLabel.secondary_color || '#8b5cf6',
        custom_domain: whiteLabel.custom_domain || '',
        logo_url: whiteLabel.logo_url || '',
        hide_powered_by: whiteLabel.hide_powered_by ?? false,
      });
      if (whiteLabel.custom_domain) setDomainStep('saved');
    }
  }, [whiteLabel]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `white-label/${client.id}/logo.${ext}`;
      const { error } = await supabase.storage.from('onboarding-uploads').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('onboarding-uploads').getPublicUrl(path);
      setForm(f => ({ ...f, logo_url: publicUrl }));
      toast.success('Logo uploaded');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = () => {
    if (form.custom_domain) setDomainStep('saved');
    saveWhiteLabel({
      client_id: client.id,
      ...form,
      brand_name: form.brand_name || null,
      custom_domain: form.custom_domain || null,
      logo_url: form.logo_url || null,
    });
  };

  const copyDnsValue = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-sm font-medium">White Label</p>
          <p className="text-xs text-muted-foreground">Custom branding for this client's ops and end-user portals</p>
        </div>
        <Switch checked={form.enabled} onCheckedChange={v => setForm(f => ({ ...f, enabled: v }))} />
      </div>

      {/* Hide "Powered by PayCore" toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-sm font-medium">Hide "Powered by PayCore"</p>
          <p className="text-xs text-muted-foreground">Remove PayCore branding from ops &amp; end-user portals</p>
        </div>
        <Switch checked={form.hide_powered_by} onCheckedChange={v => setForm(f => ({ ...f, hide_powered_by: v }))} />
      </div>

      {/* Brand */}
      <div className="space-y-1">
        <Label className="text-xs">Brand Name</Label>
        <Input className="h-8 text-xs" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="AcmePay" />
      </div>

      {/* Colours */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Primary Colour</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} className="h-8 w-8 rounded cursor-pointer border border-border flex-shrink-0" />
            <Input className="h-8 text-xs flex-1" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Secondary Colour</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="h-8 w-8 rounded cursor-pointer border border-border flex-shrink-0" />
            <Input className="h-8 text-xs flex-1" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label className="text-xs">Logo</Label>
        {form.logo_url && (
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/60">
            <img src={form.logo_url} alt="Logo preview" className="h-10 w-10 object-contain rounded" />
            <p className="text-[10px] text-muted-foreground truncate flex-1">{form.logo_url}</p>
            <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => setForm(f => ({ ...f, logo_url: '' }))}>Remove</Button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="flex-1">
            <div className={`flex items-center justify-center gap-2 h-8 px-3 rounded-md border border-dashed border-border text-xs text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
              {uploadingLogo ? 'Uploading...' : 'Upload logo file'}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
          </label>
          <Input className="h-8 text-xs flex-1" value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="or paste URL..." />
        </div>
      </div>

      {/* ── Custom Domain Setup ─────────────────────────────────────── */}
      <div className="border border-border/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/40">
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />Custom Domain
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Give this client a branded URL for their onboarding &amp; portals</p>
          </div>
          {domainStep === 'saved' && form.custom_domain && (
            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">Configured</Badge>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Domain input */}
          <div className="space-y-1.5">
            <Label className="text-xs">Domain / Subdomain</Label>
            <div className="flex gap-2">
              <Input
                className="h-8 text-xs font-mono flex-1"
                value={form.custom_domain}
                onChange={e => {
                  setForm(f => ({ ...f, custom_domain: e.target.value }));
                  setDomainStep('idle');
                }}
                placeholder="e.g. onboarding.acme.com"
              />
              {form.custom_domain && (
                <Button size="sm" variant={domainStep === 'instructions' ? 'default' : 'outline'} className="h-8 text-xs shrink-0 gap-1.5" onClick={() => setDomainStep(domainStep === 'instructions' ? 'idle' : 'instructions')}>
                  <Globe className="h-3 w-3" />
                  {domainStep === 'instructions' ? 'Hide Steps' : 'Setup Guide'}
                </Button>
              )}
            </div>
          </div>

          {/* Step-by-step DNS instructions */}
          {domainStep === 'instructions' && form.custom_domain && (
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">1</div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Add DNS Records</p>
                  <p className="text-[10px] text-muted-foreground">Log in to your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.) and add these records:</p>
                  <div className="rounded-lg border border-border overflow-hidden text-xs mt-2">
                    <div className="grid grid-cols-[50px_1fr_1fr_auto] gap-2 px-3 py-1.5 bg-muted/40 font-semibold text-muted-foreground text-[10px] uppercase tracking-wide">
                      <span>Type</span><span>Name</span><span>Value</span><span></span>
                    </div>
                    <div className="grid grid-cols-[50px_1fr_1fr_auto] gap-2 px-3 py-2 border-t border-border items-center">
                      <span className="font-mono font-bold text-primary">A</span>
                      <span className="font-mono text-[11px] truncate">
                        {form.custom_domain.includes('.') && form.custom_domain.split('.').length > 2
                          ? form.custom_domain.split('.')[0]
                          : '@'}
                      </span>
                      <span className="font-mono text-[11px]">185.158.133.1</span>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => copyDnsValue('185.158.133.1')}>
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-[50px_1fr_1fr_auto] gap-2 px-3 py-2 border-t border-border items-center">
                      <span className="font-mono font-bold text-primary">A</span>
                      <span className="font-mono text-[11px]">www</span>
                      <span className="font-mono text-[11px]">185.158.133.1</span>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => copyDnsValue('185.158.133.1')}>
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-foreground">Connect Domain in Project Settings</p>
                  <p className="text-[10px] text-muted-foreground">
                    Go to <span className="font-semibold text-foreground">Project Settings → Domains</span> and add{' '}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">{form.custom_domain}</code>{' '}
                    as a custom domain. This provisions SSL and routes traffic to the app.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-foreground">Wait for DNS Propagation</p>
                  <p className="text-[10px] text-muted-foreground">
                    DNS changes can take up to <span className="font-semibold text-foreground">72 hours</span> to propagate. You can check progress at{' '}
                    <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">dnschecker.org</a>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">4</div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-foreground">Publish &amp; Verify</p>
                  <p className="text-[10px] text-muted-foreground">
                    Once the domain status shows <span className="font-semibold text-emerald-600">Active</span>, the client's white-labeled portals will be accessible at:
                  </p>
                  <code className="text-[10px] font-mono bg-muted px-2 py-1 rounded block mt-1 break-all">
                    https://{form.custom_domain}/onboarding/{client.id}
                  </code>
                </div>
              </div>

              {/* Important notes */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200 space-y-1 text-[10px] text-amber-700">
                <p className="font-semibold text-xs">⚠️ Important Notes</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  <li>Remove any conflicting A or CNAME records for this domain before adding new ones</li>
                  <li>If using Cloudflare, set the DNS proxy to <span className="font-semibold">DNS only</span> (grey cloud) initially</li>
                  <li>Both root domain and www subdomain need separate A records</li>
                  <li>SSL certificate is provisioned automatically once the domain is verified</li>
                </ul>
              </div>
            </div>
          )}

          {domainStep === 'saved' && form.custom_domain && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Domain saved: <code className="font-mono">{form.custom_domain}</code></span>
              </div>
              <Button size="sm" variant="ghost" className="text-[10px] h-6 text-muted-foreground gap-1" onClick={() => setDomainStep('instructions')}>
                <Globe className="h-3 w-3" />View setup steps again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {form.enabled && (form.brand_name || form.primary_color) && (
        <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide font-medium">Live preview</p>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: form.primary_color + '15' }}>
            {form.logo_url && <img src={form.logo_url} alt="logo" className="h-8 w-8 object-contain rounded" />}
            <div>
              <p className="text-sm font-bold" style={{ color: form.primary_color }}>{form.brand_name || 'Brand Name'}</p>
              <p className="text-[10px] text-muted-foreground">Ops Portal</p>
            </div>
          </div>
        </div>
      )}

      <Button className="w-full h-9 text-sm" onClick={handleSave}>Save White Label Settings</Button>
    </div>
  );
}

// ── QR Code Modal ─────────────────────────────────────────────────────────────

function QrCodeModal({
  open,
  onClose,
  url,
  label,
  clientName,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  label: string;
  clientName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!open || !url) return;
    setQrReady(false);
    // Dynamic import so it doesn't bloat the initial bundle
    import('qrcode').then(QRCode => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      QRCode.toCanvas(canvas, url, {
        width: 320,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }, (err) => {
        if (!err) setQrReady(true);
      });
    });
  }, [open, url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `onboarding-qr-${clientName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">QR Code — {label}</DialogTitle>
          <DialogDescription className="text-xs">{clientName} · Scan to open onboarding form</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className={`rounded-xl border border-border/60 p-3 bg-white transition-opacity ${qrReady ? 'opacity-100' : 'opacity-0'}`}>
            <canvas ref={canvasRef} />
          </div>
          {!qrReady && (
            <div className="h-[344px] w-[344px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="w-full p-2 bg-muted/40 rounded-lg text-[11px] font-mono text-muted-foreground break-all text-center">
            {url}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleDownload} disabled={!qrReady}>
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Onboarding Link Panel ─────────────────────────────────────────────────────

function OnboardingLinkPanel({ client }: { client: DbClient }) {
  const { whiteLabel } = useClientWhiteLabel(client.id);
  const [suffix, setSuffix] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ url: string; label: string } | null>(null);

  const suffixStr = suffix.trim() ? `?ref=${encodeURIComponent(suffix.trim())}` : '';
  const defaultUrl = `${window.location.origin}/onboarding/${client.id}${suffixStr}`;
  const customDomainUrl = whiteLabel?.custom_domain
    ? `https://${whiteLabel.custom_domain}/onboarding/${client.id}${suffixStr}`
    : null;

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const LinkRow = ({ label, url, urlKey, badge }: { label: string; url: string; urlKey: string; badge?: React.ReactNode }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {badge}
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <Input readOnly value={url} className="h-9 text-xs font-mono bg-muted/50 flex-1 min-w-0" />
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0 h-9" onClick={() => handleCopy(url, urlKey)}>
          <Copy className="h-3.5 w-3.5" />{copiedKey === urlKey ? 'Copied!' : 'Copy'}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0 h-9" onClick={() => window.open(url, '_blank')}>
          <Globe className="h-3.5 w-3.5" />Open
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 shrink-0 h-9"
          onClick={() => setQrModal({ url, label })}
          title="Generate QR Code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            <rect x="5" y="5" width="3" height="3" /><rect x="16" y="5" width="3" height="3" /><rect x="5" y="16" width="3" height="3" />
            <line x1="14" y1="14" x2="14" y2="14" /><line x1="17" y1="14" x2="17" y2="14" /><line x1="20" y1="14" x2="20" y2="14" />
            <line x1="14" y1="17" x2="14" y2="17" /><line x1="17" y1="17" x2="20" y2="17" /><line x1="20" y1="20" x2="14" y2="20" />
          </svg>
          QR
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Candidate Onboarding Links</p>
        <p className="text-xs text-muted-foreground">
          Each client has a <strong>unique</strong> onboarding URL tied to their ID. Candidates registering via these links are automatically associated with <strong>{client.company_name}</strong> and no other agency.
        </p>
      </div>

      {/* URL Suffix / Campaign Tag */}
      <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">URL Suffix (optional)</Label>
          <p className="text-[11px] text-muted-foreground">Add a tracking tag or campaign label (e.g. <code className="bg-muted px-1 rounded">warehouse-drive</code>, <code className="bg-muted px-1 rounded">june-batch</code>). Appended as <code className="bg-muted px-1 rounded">?ref=…</code> so you can identify which links were shared where.</p>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground font-mono shrink-0">/onboarding/{client.id.slice(0, 8)}…?ref=</span>
            <Input
              className="h-8 text-xs flex-1"
              value={suffix}
              onChange={e => setSuffix(e.target.value.replace(/[^a-z0-9-_]/gi, ''))}
              placeholder="e.g. warehouse-june"
            />
          </div>
        </div>

        <div className="border-t border-border/40 pt-3 space-y-4">
          <LinkRow
            label="Default Onboarding URL"
            url={defaultUrl}
            urlKey="default"
            badge={<Badge variant="outline" className="text-[10px]">Always active</Badge>}
          />

          {/* Custom domain link — only if configured */}
          {customDomainUrl && (
            <>
              <div className="border-t border-border/40" />
              <LinkRow
                label="Custom Domain URL"
                url={customDomainUrl}
                urlKey="custom"
                badge={<Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">White Label</Badge>}
              />
            </>
          )}

          {!customDomainUrl && (
            <p className="text-[11px] text-muted-foreground italic">
              Configure a custom domain in the <strong>White Label</strong> tab to get a branded onboarding URL.
            </p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />How it works
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex gap-2"><span className="text-primary font-bold">1.</span>Share the link with <strong>{client.company_name}</strong> to distribute to their candidates</li>
          <li className="flex gap-2"><span className="text-primary font-bold">2.</span>Candidates complete the self-service form (customised by the agency in their Onboarding Form builder)</li>
          <li className="flex gap-2"><span className="text-primary font-bold">3.</span>Records are created in the system and visible to the agency in their Operations Portal</li>
          <li className="flex gap-2"><span className="text-primary font-bold">4.</span>The URL is unique per client — data from one agency cannot bleed into another's records</li>
        </ul>
      </div>

      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200">
        <p className="text-xs text-amber-700 font-medium mb-1">UK GDPR Note</p>
        <p className="text-xs text-amber-700">
          {client.company_name} acts as data controller for their candidates. Ensure they have a published privacy notice and a valid lawful basis (typically contract or legitimate interest) before collecting candidate personal data.
        </p>
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <QrCodeModal
          open={!!qrModal}
          onClose={() => setQrModal(null)}
          url={qrModal.url}
          label={qrModal.label}
          clientName={client.company_name}
        />
      )}
    </div>
  );
}

// ── Tool Permissions Panel ────────────────────────────────────────────────────

function ToolPermissionsPanel({ client }: { client: DbClient }) {
  const qc = useQueryClient();
  const { data: perms, isLoading } = useQuery({
    queryKey: ['client_permissions', client.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_permissions')
        .select('*')
        .eq('client_id', client.id)
        .maybeSingle();
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      const { error } = await supabase
        .from('client_permissions')
        .upsert({ client_id: client.id, ...updates }, { onConflict: 'client_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_permissions', client.id] });
      toast.success('Permissions updated');
    },
    onError: () => toast.error('Failed to update permissions'),
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const fields: { key: string; label: string; description: string }[] = [
    { key: 'can_view_dashboard', label: 'View Dashboard', description: 'Access KPI overview and charts' },
    { key: 'can_generate_invoices', label: 'Generate Master Invoices', description: 'Upload timesheets and generate PDF invoices' },
    { key: 'can_generate_self_bills', label: 'Generate Self-Billed Invoices', description: 'Generate remittance advice for contractors' },
    { key: 'can_manage_candidates', label: 'Manage Candidates', description: 'Upload and edit candidate master data' },
    { key: 'can_view_history', label: 'View History & Files', description: 'Access invoice history and file browser' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Control which tools this client can access in their Operations Portal.</p>
      {fields.map(f => (
        <div key={f.key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
          <div>
            <p className="text-xs font-medium text-foreground">{f.label}</p>
            <p className="text-[10px] text-muted-foreground">{f.description}</p>
          </div>
          <Switch
            checked={!!perms?.[f.key as keyof typeof perms]}
            onCheckedChange={v => update.mutate({ [f.key]: v })}
            disabled={update.isPending}
          />
        </div>
      ))}
    </div>
  );
}

// ── Users Panel ───────────────────────────────────────────────────────────────

function UsersPanel({ client, userType }: { client: DbClient; userType: 'client' | 'portal' }) {
  const qc = useQueryClient();
  const table = userType === 'client' ? 'client_users' : 'portal_users';
  const label = userType === 'client' ? 'Operator Login' : 'End User Login';

  const { data: users = [], isLoading } = useQuery({
    queryKey: [table, client.id],
    queryFn: async () => {
      const { data } = await supabase
        .from(table)
        .select('id, user_id, created_at')
        .eq('client_id', client.id);
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles_for', users.map(u => u.user_id)],
    enabled: users.length > 0,
    queryFn: async () => {
      const ids = users.map(u => u.user_id);
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', ids);
      return data || [];
    },
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table, client.id] });
      toast.success('User removed');
    },
    onError: () => toast.error('Failed to remove user'),
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{label}s linked to {client.company_name}.</p>
      {users.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">No {label.toLowerCase()}s linked yet.</div>
      )}
      {users.map(u => {
        const profile = profiles.find(p => p.id === u.user_id);
        return (
          <div key={u.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{(profile?.email || '?').slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile?.email || u.user_id}</p>
              {profile?.full_name && <p className="text-[10px] text-muted-foreground">{profile.full_name}</p>}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[10px] text-destructive hover:bg-destructive/10"
              onClick={() => removeUser.mutate(u.id)}
              disabled={removeUser.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ── Client Detail Panel ───────────────────────────────────────────────────────

type DetailTab = 'plan' | 'billing' | 'permissions' | 'whitelabel' | 'company_users' | 'portal_users' | 'onboarding';

const DETAIL_TABS: { id: DetailTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'plan', label: 'Plan', icon: CreditCard },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'permissions', label: 'Tool Access', icon: ShieldCheck },
  { id: 'whitelabel', label: 'White Label', icon: Palette },
  { id: 'onboarding', label: 'Onboarding', icon: Users2 },
  { id: 'company_users', label: 'Company Logins', icon: Building2 },
  { id: 'portal_users', label: 'End Users', icon: Users },
];

function ClientDetailPanel({ client, onClose }: { client: DbClient; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>('plan');
  const { plans } = useClientPlans(client.id);
  const plan = plans[0];

  // Get candidate count for limit check
  const { data: candidateCount = 0 } = useQuery({
    queryKey: ['candidate_count_client', client.id],
    queryFn: async () => {
      // Count candidates from invoices for this client
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id);
      return count || 0;
    },
  });

  const planDef = plan ? PRICING_PLANS.find(p => p.id === plan.plan_tier) : null;
  const candidateLimit = planDef?.candidateLimit;
  const contractedCandidates = plan?.notes ? parseInt(plan.notes.match(/candidates:(\d+)/)?.[1] || '0') : 0;
  const limitToShow = contractedCandidates || candidateLimit;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border/60 p-5 bg-card">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{client.company_name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />{client.address_line_1}, {client.city}, {client.postcode}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {plan && <Badge className={`text-[10px] ${planColor(plan.plan_tier)}`}>{plan.plan_name}</Badge>}
              {plan && <Badge className={`text-[10px] ${statusColor(plan.status)}`}>{plan.status}</Badge>}
              {limitToShow ? (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Users2 className="h-2.5 w-2.5" />
                  {contractedCandidates}/{limitToShow} candidates
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 bg-card px-4 overflow-x-auto">
        <div className="flex gap-1 py-1">
          {DETAIL_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <t.icon className="h-3 w-3" />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === 'plan' && <PlanPanel client={client} />}
        {tab === 'billing' && <BillingPanel client={client} />}
        {tab === 'permissions' && <ToolPermissionsPanel client={client} />}
        {tab === 'whitelabel' && <WhiteLabelPanel client={client} />}
        {tab === 'onboarding' && <OnboardingLinkPanel client={client} />}
        {tab === 'company_users' && <UsersPanel client={client} userType="client" />}
        {tab === 'portal_users' && <UsersPanel client={client} userType="portal" />}
      </div>
    </div>
  );
}

// ── Client List Item ──────────────────────────────────────────────────────────

function ClientListItem({ client, selected, onClick }: { client: DbClient; selected: boolean; onClick: () => void }) {
  const { plans } = useClientPlans(client.id);
  const plan = plans[0];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors hover:bg-muted/40 ${selected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-primary/15' : 'bg-muted'}`}>
          <Building2 className={`h-4 w-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{client.company_name}</p>
          <p className="text-xs text-muted-foreground truncate">{client.city}, {client.country}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {plan && <Badge className={`text-[9px] ${planColor(plan.plan_tier)}`}>{plan.plan_name?.split(' – ')[1] || plan.plan_tier}</Badge>}
          {plan && <Badge className={`text-[9px] ${statusColor(plan.status)}`}>{plan.status}</Badge>}
        </div>
      </div>
    </button>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function PayCoreClientManager() {
  const { clients, isLoading, refetch } = useClients();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedId) ?? null;

  if (!selectedId && filtered.length > 0) {
    setSelectedId(filtered[0].id);
  }

  return (
    <div className="flex h-full rounded-xl border border-border/60 overflow-hidden bg-card" style={{ minHeight: '600px' }}>
      {/* Left: Client List */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border/60">
        <div className="p-3 border-b border-border/60 space-y-2 bg-card">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <AddClientDialog onAdded={() => { refetch(); }} />
          </div>
          <p className="text-[10px] text-muted-foreground px-1">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Building2 className="h-8 w-8 opacity-30" />
              <p className="text-xs">{search ? 'No matches' : 'No clients yet'}</p>
            </div>
          ) : (
            filtered.map(client => (
              <ClientListItem
                key={client.id}
                client={client}
                selected={selectedId === client.id}
                onClick={() => setSelectedId(client.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 overflow-hidden">
        {selectedClient ? (
          <ClientDetailPanel client={selectedClient} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Building2 className="h-12 w-12 opacity-20" />
            <p className="text-sm">Select a client to manage</p>
          </div>
        )}
      </div>
    </div>
  );
}
