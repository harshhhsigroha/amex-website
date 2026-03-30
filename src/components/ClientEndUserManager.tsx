import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, Users, ExternalLink, Loader2, Copy, Edit2, Key, Eye, EyeOff, XCircle, ShieldCheck } from 'lucide-react';
import { PortalPermissionsManager } from '@/components/PortalPermissionsManager';
import { PasswordStrength, isPasswordStrong } from '@/components/auth/PasswordStrength';

interface PortalUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export function ClientEndUserManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  // Edit/Password dialogs
  const [editUser, setEditUser] = useState<PortalUser | null>(null);
  const [editName, setEditName] = useState('');
  const [pwUser, setPwUser] = useState<PortalUser | null>(null);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permsUser, setPermsUser] = useState<PortalUser | null>(null);

  const { data: clientId } = useQuery({
    queryKey: ['my_client_id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('client_users').select('client_id').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return data?.client_id ?? null;
    },
    enabled: !!user,
  });

  const { data: portalUsers = [], isLoading } = useQuery({
    queryKey: ['my_portal_users', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data: links, error } = await supabase
        .from('portal_users').select('id, user_id, created_at').eq('client_id', clientId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!links || links.length === 0) return [];

      const userIds = links.map((l: { user_id: string }) => l.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);

      return links.map((l: { id: string; user_id: string; created_at: string }) => ({
        id: l.id,
        user_id: l.user_id,
        created_at: l.created_at,
        email: profiles?.find(p => p.id === l.user_id)?.email || '',
        full_name: profiles?.find(p => p.id === l.user_id)?.full_name || null,
      })) as PortalUser[];
    },
    enabled: !!clientId,
  });

  const createUser = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error('No client linked to your account');
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-client-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, clientId, userType: 'portal' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create end user');
      return json;
    },
    onSuccess: () => {
      toast.success('End user created', { description: `${form.email} can now log in at /auth/portal` });
      setShowAdd(false);
      setForm({ email: '', password: '', fullName: '' });
      qc.invalidateQueries({ queryKey: ['my_portal_users', clientId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeUser = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('portal_users').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('End user removed');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['my_portal_users', clientId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const callUpdateFn = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-client-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  };

  const handleSaveEdit = async () => {
    if (!editUser || !editName.trim()) return;
    setSavingEdit(true);
    try {
      await callUpdateFn({ userId: editUser.user_id, fullName: editName, action: 'update_info' });
      toast.success('User updated');
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ['my_portal_users', clientId] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSavePassword = async () => {
    if (!pwUser) return;
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await callUpdateFn({ userId: pwUser.user_id, newPassword: newPw, action: 'password' });
      toast.success('Password updated', { description: `Changed for ${pwUser.email}` });
      setPwUser(null);
      setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingPw(false);
    }
  };

  const portalLoginUrl = `${window.location.origin}/auth/portal`;
  const copyPortalLink = () => { navigator.clipboard.writeText(portalLoginUrl); toast.success('Portal login link copied'); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">End Users</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage portal access for your clients. They log in at{' '}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/auth/portal</span>.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">End User Login Portal</p>
              <p className="text-xs text-muted-foreground font-mono">{portalLoginUrl}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-2 shrink-0" onClick={copyPortalLink}>
            <Copy className="h-3.5 w-3.5" />Copy Link
          </Button>
        </CardContent>
      </Card>

      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{portalUsers.length} end user{portalUsers.length !== 1 ? 's' : ''}</span>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowAdd(v => !v)}>
          <UserPlus className="h-4 w-4" />Add End User
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create End User Login</CardTitle>
            <CardDescription className="text-xs">
              This user will be able to log in via the End User portal at <code className="font-mono">/auth/portal</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input className="h-8 text-sm" placeholder="Jane Smith" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Address</Label>
                <Input className="h-8 text-sm" type="email" placeholder="jane@theirclient.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <Input className="h-8 text-sm" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                {form.password && <PasswordStrength password={form.password} className="mt-1" />}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => createUser.mutate()} disabled={createUser.isPending || !form.email || !form.password || !form.fullName || !isPasswordStrong(form.password)}>
                {createUser.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Create User
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && portalUsers.length === 0 && !showAdd && (
          <Card className="border-dashed border-border/60">
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No end users yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first end user to give them portal access</p>
              </div>
              <Button size="sm" className="gap-2 mt-2" onClick={() => setShowAdd(true)}>
                <UserPlus className="h-4 w-4" />Add End User
              </Button>
            </CardContent>
          </Card>
        )}
        {portalUsers.map(u => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {(u.full_name || u.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] mr-1">End User</Badge>
              <p className="text-xs text-muted-foreground hidden sm:block mr-2">{new Date(u.created_at).toLocaleDateString('en-GB')}</p>
              {/* Actions revealed on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Manage permissions" onClick={() => setPermsUser(u)}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Edit info" onClick={() => { setEditUser(u); setEditName(u.full_name || ''); }}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Change password" onClick={() => { setPwUser(u); setNewPw(''); setConfirmPw(''); }}>
                  <Key className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Remove user" onClick={() => setDeleteId(u.id)} disabled={removeUser.isPending}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Info Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="h-4 w-4" />Edit User Info</DialogTitle>
            <DialogDescription className="text-xs">{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input className="h-8 text-sm" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Jane Smith" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={savingEdit || !editName.trim()}>
              {savingEdit && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!pwUser} onOpenChange={() => setPwUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="h-4 w-4" />Change Password</DialogTitle>
            <DialogDescription className="text-xs">{pwUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning-foreground">
              The user will need to use this new password on their next login.
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Password</Label>
              <div className="relative">
                <Input className="h-8 text-sm pr-9" type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {newPw && <PasswordStrength password={newPw} className="mt-1" />}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confirm Password</Label>
              <Input className="h-8 text-sm" type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" />
            </div>
            {newPw && confirmPw && newPw !== confirmPw && (
              <p className="text-xs text-destructive flex items-center gap-1"><XCircle className="h-3 w-3" />Passwords don't match</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPwUser(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSavePassword} disabled={savingPw || !newPw || newPw !== confirmPw || !isPasswordStrong(newPw)}>
              {savingPw && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portal Permissions */}
      {clientId && <PortalPermissionsManager clientId={clientId} />}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove end user?</AlertDialogTitle>
            <AlertDialogDescription>This will revoke their portal access. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteId && removeUser.mutate(deleteId)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
