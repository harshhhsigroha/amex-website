/**
 * ClientTeamManagement
 * Allows a client user to add sub-team members who can
 * access their portal and configure their permissions.
 * These team members are stored in client_users table linked to the client_id.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, UserPlus, Trash2, Loader2, Mail, Shield,
  Settings, ChevronDown, ChevronUp, Key, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  user_id: string;
  client_id: string;
  created_at: string;
  email?: string;
  full_name?: string;
  permissions?: {
    can_view_dashboard: boolean;
    can_generate_invoices: boolean;
    can_generate_self_bills: boolean;
    can_manage_candidates: boolean;
    can_view_history: boolean;
  };
}

const DEFAULT_PERMISSIONS = {
  can_view_dashboard: true,
  can_generate_invoices: false,
  can_generate_self_bills: false,
  can_manage_candidates: false,
  can_view_history: true,
};

const PERMISSION_LABELS: Record<string, string> = {
  can_view_dashboard: 'View Dashboard',
  can_generate_invoices: 'Generate Master Invoices',
  can_generate_self_bills: 'Generate Self-Bills',
  can_manage_candidates: 'Manage Candidates',
  can_view_history: 'View Invoice History & Files',
};

export function ClientTeamManagement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPermissions, setFormPermissions] = useState({ ...DEFAULT_PERMISSIONS });

  // Get Tony's client_id
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

  // Fetch team members (other client_users sharing the same client_id, excluding Tony himself)
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['client_team_members', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data: cuData, error } = await supabase
        .from('client_users')
        .select('*')
        .eq('client_id', clientId)
        .neq('user_id', user?.id ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!cuData || cuData.length === 0) return [];

      // Enrich with profile info
      const userIds = cuData.map(cu => cu.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Fetch permissions from admin_permissions table
      const { data: permsData } = await supabase
        .from('admin_permissions')
        .select('*')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const permsMap = new Map(permsData?.map(p => [p.user_id, p]) || []);

      return cuData.map(cu => {
        const profile = profileMap.get(cu.user_id);
        const perms = permsMap.get(cu.user_id);
        return {
          ...cu,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name || '',
          permissions: perms ? {
            can_view_dashboard: perms.can_view_dashboard,
            can_generate_invoices: perms.can_generate_invoices,
            can_generate_self_bills: perms.can_generate_self_bills,
            can_manage_candidates: perms.can_manage_candidates,
            can_view_history: perms.can_view_history,
          } : { ...DEFAULT_PERMISSIONS },
        } as TeamMember;
      });
    },
    enabled: !!clientId,
  });

  const handleAddMember = async () => {
    if (!formEmail || !formPassword || !formName || !clientId) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      // Create the user via edge function
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: formEmail,
          password: formPassword,
          fullName: formName,
          clientId,
          permissions: formPermissions,
        },
      });

      if (error || !data?.success) {
        const msg = (error as any)?.context?.body?.error || error?.message || data?.error || 'Failed to create team member';
        throw new Error(msg);
      }

      // Set admin_permissions for this new user
      if (data.userId) {
        await supabase.from('admin_permissions').upsert({
          user_id: data.userId,
          ...formPermissions,
        }, { onConflict: 'user_id' });
      }

      toast.success('Team member added', { description: `Login: ${formEmail}` });
      setIsAddOpen(false);
      setFormEmail(''); setFormName(''); setFormPassword('');
      setFormPermissions({ ...DEFAULT_PERMISSIONS });
      qc.invalidateQueries({ queryKey: ['client_team_members', clientId] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add team member');
    } finally {
      setIsCreating(false);
    }
  };

  const updatePermissions = async (member: TeamMember, key: string, value: boolean) => {
    const updated = { ...(member.permissions || DEFAULT_PERMISSIONS), [key]: value };
    const { error } = await supabase.from('admin_permissions').upsert({
      user_id: member.user_id,
      ...updated,
    }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to update permissions');
      return;
    }
    toast.success('Permissions updated');
    qc.invalidateQueries({ queryKey: ['client_team_members', clientId] });
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.email} from your team?`)) return;
    const { error } = await supabase.from('client_users').delete().eq('id', member.id);
    if (error) { toast.error('Failed to remove team member'); return; }
    toast.success('Team member removed');
    qc.invalidateQueries({ queryKey: ['client_team_members', clientId] });
  };

  const handleUpdatePassword = async () => {
    if (!selectedMember || !newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-client-password', {
        body: { userId: selectedMember.user_id, newPassword },
      });
      if (error || !data?.success) throw new Error('Failed to update password');
      toast.success('Password updated');
      setIsPasswordDialogOpen(false);
      setNewPassword('');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Team Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Add team members to help manage your operations portal and configure their access permissions.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Team Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tm-name">Full Name</Label>
                  <Input id="tm-name" placeholder="Jane Smith" value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-email">Email Address</Label>
                  <Input id="tm-email" type="email" placeholder="jane@yourcompany.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-password">Initial Password</Label>
                  <Input id="tm-password" type="password" placeholder="Min. 6 characters" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Share these credentials securely with the team member</p>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Access Permissions</p>
                </div>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <Label htmlFor={`perm-${key}`} className="text-sm font-normal cursor-pointer">{label}</Label>
                    <Switch
                      id={`perm-${key}`}
                      checked={formPermissions[key as keyof typeof formPermissions]}
                      onCheckedChange={v => setFormPermissions(p => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleAddMember} disabled={isCreating} className="w-full">
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add Team Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Team Members</p>
                <p className="text-xl font-bold text-foreground">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">With Full Access</p>
                <p className="text-xl font-bold text-foreground">
                  {members.filter(m => m.permissions?.can_generate_invoices && m.permissions?.can_generate_self_bills).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Settings className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">View-Only Access</p>
                <p className="text-xl font-bold text-foreground">
                  {members.filter(m => !m.permissions?.can_generate_invoices).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No team members yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Add team members to help manage your operations portal</p>
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Team Member
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map(member => (
                <div key={member.id}>
                  {/* Member Row */}
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                          {(member.full_name || member.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{member.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      {member.permissions?.can_generate_invoices && (
                        <Badge variant="secondary" className="text-[10px]">Invoices</Badge>
                      )}
                      {member.permissions?.can_generate_self_bills && (
                        <Badge variant="secondary" className="text-[10px]">Self-Bills</Badge>
                      )}
                      {!member.permissions?.can_generate_invoices && !member.permissions?.can_generate_self_bills && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">View Only</Badge>
                      )}
                    </div>
                    <p className="hidden md:block text-xs text-muted-foreground shrink-0">{formatDate(member.created_at)}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Change Password"
                        onClick={() => { setSelectedMember(member); setNewPassword(''); setShowPassword(false); setIsPasswordDialogOpen(true); }}
                      >
                        <Key className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className={cn('h-8 w-8 text-muted-foreground hover:text-foreground')}
                        onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                        title="Manage Permissions"
                      >
                        {expandedMember === member.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(member)}
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Permissions */}
                  {expandedMember === member.id && (
                    <div className="px-6 pb-4 pt-2 bg-muted/20 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions for {member.full_name || member.email}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/60">
                            <Label htmlFor={`${member.id}-${key}`} className="text-xs font-normal cursor-pointer">{label}</Label>
                            <Switch
                              id={`${member.id}-${key}`}
                              checked={member.permissions?.[key as keyof typeof DEFAULT_PERMISSIONS] ?? false}
                              onCheckedChange={v => updatePermissions(member, key, v)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Changing password for</p>
              <p className="text-sm font-medium">{selectedMember?.full_name || selectedMember?.email}</p>
              <p className="text-xs text-muted-foreground">{selectedMember?.email}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                />
                <Button type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword || !newPassword} className="w-full">
              {isUpdatingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
