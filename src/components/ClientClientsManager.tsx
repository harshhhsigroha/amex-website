/**
 * ClientClientsManager
 * My Clients tab — Tony manages his invoice-recipient companies (sub-clients)
 * AND his portal end-users, all in one unified view.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubClients } from '@/hooks/useSubClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Building2, UserPlus, Trash2, Loader2, Copy, ExternalLink,
  Search, Plus, MapPin, Globe, Edit2, Users, CheckCircle2, Link2, ShieldCheck,
} from 'lucide-react';
import { PortalPermissionsManager } from '@/components/PortalPermissionsManager';
import { DbClient } from '@/types/database';

interface EndClient {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  sub_client_id: string | null;
}

// ── Shared form field ────────────────────────────────────────────────────────
function FormField({
  id, label, placeholder, optional, value, onChange, error, type = 'text',
}: {
  id: string; label: string; placeholder: string; optional?: boolean;
  value: string; onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}{optional && <span className="ml-1 text-muted-foreground/60">(optional)</span>}
      </Label>
      <Input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Company form state type ──────────────────────────────────────────────────
type CompanyForm = {
  company_name: string; address_line_1: string; address_line_2: string;
  city: string; postcode: string; country: string;
};

const emptyCompany: CompanyForm = {
  company_name: '', address_line_1: '', address_line_2: '', city: '', postcode: '', country: 'United Kingdom',
};

function validateCompany(form: CompanyForm) {
  const e: Record<string, string> = {};
  if (!form.company_name.trim()) e.company_name = 'Required';
  if (!form.address_line_1.trim()) e.address_line_1 = 'Required';
  if (!form.city.trim()) e.city = 'Required';
  if (!form.postcode.trim()) e.postcode = 'Required';
  if (!form.country.trim()) e.country = 'Required';
  return e;
}

// ── Add Company Dialog ───────────────────────────────────────────────────────
function AddCompanyDialog({
  open, onOpenChange, onSave, parentClientId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (c: Omit<DbClient, 'id' | 'created_at' | 'updated_at'>, parentId: string) => Promise<{ success: boolean; data: DbClient | null }>;
  parentClientId: string | null;
}) {
  const [form, setForm] = useState(emptyCompany);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (field: keyof CompanyForm) => (v: string) => setForm(f => ({ ...f, [field]: v }));

  const handleSave = async () => {
    const e = validateCompany(form);
    setErrors(e);
    if (Object.keys(e).length > 0 || !parentClientId) return;
    setSaving(true);
    const result = await onSave({
      company_name: form.company_name.trim(),
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || null,
      city: form.city.trim(), postcode: form.postcode.trim(), country: form.country.trim(),
    }, parentClientId);
    setSaving(false);
    if (result.success) { setForm(emptyCompany); setErrors({}); onOpenChange(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!saving) { onOpenChange(v); if (!v) { setForm(emptyCompany); setErrors({}); } } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Add Client Company</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                This company will be available to select in Master Invoice &amp; Self-Billed tabs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <FormField id="company_name" label="Company Name" placeholder="Acme Ltd" value={form.company_name} onChange={set('company_name')} error={errors.company_name} />
          <FormField id="address_line_1" label="Address Line 1" placeholder="123 Business Park" value={form.address_line_1} onChange={set('address_line_1')} error={errors.address_line_1} />
          <FormField id="address_line_2" label="Address Line 2" placeholder="Suite 4B" optional value={form.address_line_2} onChange={set('address_line_2')} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="city" label="City" placeholder="London" value={form.city} onChange={set('city')} error={errors.city} />
            <FormField id="postcode" label="Postcode" placeholder="EC1A 1BB" value={form.postcode} onChange={set('postcode')} error={errors.postcode} />
          </div>
          <FormField id="country" label="Country" placeholder="United Kingdom" value={form.country} onChange={set('country')} error={errors.country} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Save Company
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Company Dialog ──────────────────────────────────────────────────────
function EditCompanyDialog({
  open, onOpenChange, company, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  company: DbClient | null;
  onSave: (id: string, updates: Partial<DbClient>) => Promise<{ success: boolean }>;
}) {
  const [form, setForm] = useState<CompanyForm>(emptyCompany);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Use open state to reset/populate form
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && company) {
      setForm({
        company_name: company.company_name,
        address_line_1: company.address_line_1,
        address_line_2: company.address_line_2 || '',
        city: company.city,
        postcode: company.postcode,
        country: company.country,
      });
      setErrors({});
    }
    if (!saving) onOpenChange(isOpen);
  };

  const set = (field: keyof CompanyForm) => (v: string) => setForm(f => ({ ...f, [field]: v }));

  const handleSave = async () => {
    const e = validateCompany(form);
    setErrors(e);
    if (Object.keys(e).length > 0 || !company) return;
    setSaving(true);
    const result = await onSave(company.id, {
      company_name: form.company_name.trim(),
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || null,
      city: form.city.trim(),
      postcode: form.postcode.trim(),
      country: form.country.trim(),
    });
    setSaving(false);
    if (result.success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Edit2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-base">Edit Company</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Update the details for this invoice recipient company.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <FormField id="edit_company_name" label="Company Name" placeholder="Acme Ltd" value={form.company_name} onChange={set('company_name')} error={errors.company_name} />
          <FormField id="edit_address_line_1" label="Address Line 1" placeholder="123 Business Park" value={form.address_line_1} onChange={set('address_line_1')} error={errors.address_line_1} />
          <FormField id="edit_address_line_2" label="Address Line 2" placeholder="Suite 4B" optional value={form.address_line_2} onChange={set('address_line_2')} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="edit_city" label="City" placeholder="London" value={form.city} onChange={set('city')} error={errors.city} />
            <FormField id="edit_postcode" label="Postcode" placeholder="EC1A 1BB" value={form.postcode} onChange={set('postcode')} error={errors.postcode} />
          </div>
          <FormField id="edit_country" label="Country" placeholder="United Kingdom" value={form.country} onChange={set('country')} error={errors.country} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Portal User Dialog ───────────────────────────────────────────────────
function AddPortalUserDialog({
  open, onOpenChange, clientId, onSuccess, subClients,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string | null;
  onSuccess: () => void;
  subClients: DbClient[];
}) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', subClientId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password.trim()) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !clientId) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-client-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          email: form.email, password: form.password, fullName: form.fullName,
          clientId, userType: 'portal',
          subClientId: form.subClientId && form.subClientId !== 'none' ? form.subClientId : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');
      toast.success('Portal user created', { description: `${form.email} can now log in at /auth/portal` });
      setForm({ fullName: '', email: '', password: '', subClientId: '' });
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!saving) { onOpenChange(v); if (!v) { setForm({ fullName: '', email: '', password: '', subClientId: '' }); setErrors({}); } } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-base">Add Portal User</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Grant an end-client login access to the portal at <span className="font-mono">/auth/portal</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <FormField id="fullName" label="Full Name" placeholder="Jane Smith" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} error={errors.fullName} />
          <FormField id="email" label="Email Address" placeholder="jane@theirclient.com" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} error={errors.email} />
          <FormField id="password" label="Password" placeholder="••••••••" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} error={errors.password} />

          {/* Invoice recipient selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Link to Invoice Recipient <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Select value={form.subClientId} onValueChange={v => setForm(f => ({ ...f, subClientId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No company link</SelectItem>
                {subClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Linking restricts this user to only see content for the selected company.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Create Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign Company Dialog (edit portal user's company) ───────────────────────
function AssignCompanyDialog({
  open, onOpenChange, endClient, subClients, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  endClient: EndClient | null;
  subClients: DbClient[];
  onSave: (linkId: string, subClientId: string | null) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState('none');
  const [saving, setSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && endClient) {
      setSelectedId(endClient.sub_client_id || 'none');
    }
    if (!saving) onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!endClient) return;
    setSaving(true);
    await onSave(endClient.id, selectedId === 'none' ? null : selectedId);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <DialogTitle className="text-base">Link to Company</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Restrict <span className="font-medium">{endClient?.full_name || endClient?.email}</span> to a specific invoice recipient company.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-medium text-muted-foreground">Invoice Recipient Company</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No restriction (see all)</SelectItem>
              {subClients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground pt-1">
            When linked, this user will only see invoices and content for the selected company.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Save Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function ClientClientsManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<DbClient | null>(null);
  const [assignDialog, setAssignDialog] = useState<EndClient | null>(null);
  const [permissionsDialogUser, setPermissionsDialogUser] = useState<EndClient | null>(null);

  const { subClients, isLoading: subClientsLoading, addSubClient, updateSubClient } = useSubClients();

  const { data: clientId } = useQuery({
    queryKey: ['my_client_id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('client_users').select('client_id').eq('user_id', user.id).maybeSingle();
      return data?.client_id ?? null;
    },
    enabled: !!user,
  });

  const { data: endClients = [], isLoading: portalLoading } = useQuery({
    queryKey: ['end_clients', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data: links, error } = await supabase
        .from('portal_users').select('id, user_id, created_at, sub_client_id')
        .eq('client_id', clientId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!links || links.length === 0) return [];
      const userIds = links.map((l: any) => l.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);
      return links.map((l: any) => ({
        id: l.id, user_id: l.user_id, created_at: l.created_at,
        sub_client_id: l.sub_client_id ?? null,
        email: profiles?.find(p => p.id === l.user_id)?.email || '',
        full_name: profiles?.find(p => p.id === l.user_id)?.full_name || null,
      })) as EndClient[];
    },
    enabled: !!clientId,
  });

  const removePortalUser = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('portal_users').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Portal access removed'); qc.invalidateQueries({ queryKey: ['end_clients', clientId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignCompany = async (linkId: string, subClientId: string | null) => {
    const { error } = await supabase
      .from('portal_users')
      .update({ sub_client_id: subClientId } as any)
      .eq('id', linkId);
    if (error) { toast.error('Failed to update company link'); }
    else { toast.success('Company link updated'); qc.invalidateQueries({ queryKey: ['end_clients', clientId] }); }
  };

  const portalUrl = `${window.location.origin}/auth/portal`;

  const filteredCompanies = subClients.filter(c => {
    const q = search.toLowerCase();
    return c.company_name.toLowerCase().includes(q) || c.postcode.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  const filteredPortal = endClients.filter(c => {
    const q = search.toLowerCase();
    return (c.full_name || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const SectionHeader = ({ title, count, onAdd, addLabel }: { title: string; count: number; onAdd: () => void; addLabel: string }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
      </div>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />{addLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">My Clients</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage invoice recipients and portal access for your clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl border border-border bg-card">
            <p className="text-xl font-bold text-foreground">{subClients.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Companies</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl border border-border bg-card">
            <p className="text-xl font-bold text-foreground">{endClients.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Portal Users</p>
          </div>
        </div>
      </div>

      {/* Portal URL Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Client Portal URL</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{portalUrl}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-2 shrink-0" onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success('Link copied'); }}>
          <Copy className="h-3.5 w-3.5" />Copy
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search companies or users…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="companies">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-3.5 w-3.5" />Invoice Recipients
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-2">
            <Users className="h-3.5 w-3.5" />Portal Users
          </TabsTrigger>
        </TabsList>

        {/* ── Invoice Recipients ── */}
        <TabsContent value="companies" className="mt-0">
          <SectionHeader
            title="Invoice Recipient Companies"
            count={filteredCompanies.length}
            onAdd={() => setAddCompanyOpen(true)}
            addLabel="Add Company"
          />

          {subClientsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border/60 py-16 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {search ? 'No companies match your search' : 'No companies yet'}
                </p>
                {!search && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a company to use it when generating invoices
                  </p>
                )}
              </div>
              {!search && (
                <Button size="sm" className="gap-2 mt-1" onClick={() => setAddCompanyOpen(true)}>
                  <Plus className="h-4 w-4" />Add Company
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map(c => (
                <div key={c.id} className="group rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-200 p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {c.company_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{c.company_name}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          <Building2 className="h-2.5 w-2.5 mr-1" />Invoice Recipient
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{c.city}, {c.postcode}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />{c.country}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {c.address_line_1}{c.address_line_2 ? `, ${c.address_line_2}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon" variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditCompany(c)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Portal Users ── */}
        <TabsContent value="portal" className="mt-0">
          <SectionHeader
            title="Portal Login Users"
            count={filteredPortal.length}
            onAdd={() => setAddPortalOpen(true)}
            addLabel="Add User"
          />

          {portalLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPortal.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border/60 py-16 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {search ? 'No users match your search' : 'No portal users yet'}
                </p>
                {!search && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a portal user to give them access at /auth/portal
                  </p>
                )}
              </div>
              {!search && (
                <Button size="sm" className="gap-2 mt-1" onClick={() => setAddPortalOpen(true)}>
                  <UserPlus className="h-4 w-4" />Add Portal User
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPortal.map(u => {
                const linkedCompany = u.sub_client_id ? subClients.find(c => c.id === u.sub_client_id) : null;
                return (
                  <div key={u.id} className="group rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-600 shrink-0">
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{u.full_name || u.email}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            <Users className="h-2.5 w-2.5 mr-1" />Portal User
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                        {linkedCompany ? (
                          <div className="flex items-center gap-1 mt-1">
                            <Link2 className="h-3 w-3 text-sky-500" />
                            <span className="text-[11px] text-sky-600 font-medium">{linkedCompany.company_name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 mt-1 block">No company linked — sees all content</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] text-muted-foreground/60 hidden sm:block mr-1">
                          {new Date(u.created_at).toLocaleDateString('en-GB')}
                        </p>
                        <Button
                          size="icon" variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Link to company"
                          onClick={() => setAssignDialog(u)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon" variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { if (confirm(`Remove portal access for ${u.email}?`)) removePortalUser.mutate(u.id); }}
                          disabled={removePortalUser.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddCompanyDialog
        open={addCompanyOpen}
        onOpenChange={setAddCompanyOpen}
        onSave={addSubClient}
        parentClientId={clientId ?? null}
      />
      <EditCompanyDialog
        open={!!editCompany}
        onOpenChange={v => { if (!v) setEditCompany(null); }}
        company={editCompany}
        onSave={updateSubClient}
      />
      <AddPortalUserDialog
        open={addPortalOpen}
        onOpenChange={setAddPortalOpen}
        clientId={clientId ?? null}
        subClients={subClients}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['end_clients', clientId] })}
      />
      <AssignCompanyDialog
        open={!!assignDialog}
        onOpenChange={v => { if (!v) setAssignDialog(null); }}
        endClient={assignDialog}
        subClients={subClients}
        onSave={assignCompany}
      />
    </div>
  );
}
