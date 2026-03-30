/**
 * ============================================================================
 * ClientUserManagement
 * ============================================================================
 * Used in: AdminPanel (super-admin facing)
 * Purpose: Lets super-admins manage client portal logins — create new logins
 *          tied to a company, change passwords, remove access, and manage
 *          per-client portal permissions.
 *
 * Key behaviours:
 *   - Lists ALL client_users across every company (admin-wide view)
 *   - Creates users via `create-client-user` edge function
 *   - Password changes via `update-client-password` edge function
 *   - Permissions managed via <PortalPermissionsManager>
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DbClient } from '@/types/database';

// ── UI Components ───────────────────────────────────────────────────────────
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  UserPlus, Trash2, Loader2, Building2, Mail, Key,
  Eye, EyeOff, ShieldCheck,
} from 'lucide-react';

// ── Feature Components ──────────────────────────────────────────────────────
import { PortalPermissionsManager } from '@/components/PortalPermissionsManager';

// ── Types ───────────────────────────────────────────────────────────────────
interface ClientUser {
  id: string;
  user_id: string;
  client_id: string;
  created_at: string;
  email?: string;
  client_name?: string;
}

interface ClientUserManagementProps {
  clients: DbClient[];
}

// ── Helper: format date to dd/mm/yyyy ───────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Main Component ──────────────────────────────────────────────────────────
export function ClientUserManagement({ clients }: ClientUserManagementProps) {
  const { isSuperAdmin } = useAuth();

  // ── Data state ──────────────────────────────────────────────────────────
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Create user dialog ──────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  // ── Password change dialog ──────────────────────────────────────────────
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<ClientUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ── Permissions dialog ──────────────────────────────────────────────────
  const [isPermsDialogOpen, setIsPermsDialogOpen] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<ClientUser | null>(null);

  // ── Fetch all client users with profile + company info ──────────────────
  const fetchClientUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('client_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client users:', error);
      toast.error('Failed to load client users');
      setIsLoading(false);
      return;
    }

    const userIds = data.map((cu) => cu.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);
    const clientMap = new Map(clients.map((c) => [c.id, c.company_name]));

    setClientUsers(
      data.map((cu) => ({
        ...cu,
        email: profileMap.get(cu.user_id) || 'Unknown',
        client_name: clientMap.get(cu.client_id) || 'Unknown',
      })),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClientUsers();
  }, [clients]);

  // ── Create client user ──────────────────────────────────────────────────
  const handleCreateClientUser = async () => {
    if (!email || !password || !selectedClientId || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { email, password, fullName, clientId: selectedClientId },
      });

      if (error) {
        const bodyError = (error as any)?.context?.body?.error;
        throw new Error(bodyError || error.message || 'Failed to create client user');
      }
      if (!data?.success) throw new Error(data?.error || 'Failed to create client user');

      toast.success('Client user created successfully', { description: `Login: ${email}` });
      setIsDialogOpen(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setSelectedClientId('');
      fetchClientUsers();
    } catch (error: any) {
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        toast.error('This email is already registered');
      } else {
        toast.error(error.message || 'Failed to create client user');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Remove client user ──────────────────────────────────────────────────
  const handleDeleteClientUser = async (clientUser: ClientUser) => {
    if (!confirm(`Remove access for ${clientUser.email}?`)) return;
    const { error } = await supabase.from('client_users').delete().eq('id', clientUser.id);
    if (error) {
      toast.error('Failed to remove client user');
      return;
    }
    toast.success('Client user access removed');
    fetchClientUsers();
  };

  // ── Password change ─────────────────────────────────────────────────────
  const handleOpenPasswordDialog = (user: ClientUser) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setShowNewPassword(false);
    setIsPasswordDialogOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUserForPassword || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-client-password', {
        body: { userId: selectedUserForPassword.user_id, newPassword },
      });

      if (error) {
        const bodyError = (error as any)?.context?.body?.error;
        throw new Error(bodyError || error.message || 'Failed to update password');
      }
      if (!data?.success) throw new Error(data?.error || 'Failed to update password');

      toast.success('Password updated successfully', {
        description: `Password changed for ${selectedUserForPassword.email}`,
      });
      setIsPasswordDialogOpen(false);
      setSelectedUserForPassword(null);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="border-border/50">
      {/* ── Card Header + Create Button ─────────────────────────────────── */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Client Portal Logins
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />Create Login
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Client Portal User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Company</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client company" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  <p className="text-xs text-muted-foreground">Share these credentials securely with the client</p>
                </div>
                <Button onClick={handleCreateClientUser} className="w-full" disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Client User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* ── Users Table ─────────────────────────────────────────────────── */}
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">
                    <Mail className="h-4 w-4 inline mr-2" />Email
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Building2 className="h-4 w-4 inline mr-2" />Company
                  </TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="w-[140px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No client users yet
                    </TableCell>
                  </TableRow>
                ) : (
                  clientUsers.map((cu) => (
                    <TableRow key={cu.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{cu.email}</TableCell>
                      <TableCell>{cu.client_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(cu.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Permissions */}
                          <Button
                            variant="ghost" size="sm"
                            className="text-primary hover:text-primary"
                            title="Manage Permissions"
                            onClick={() => { setSelectedUserForPerms(cu); setIsPermsDialogOpen(true); }}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          {/* Password (super admin only) */}
                          {isSuperAdmin && (
                            <Button
                              variant="ghost" size="sm"
                              className="text-primary hover:text-primary"
                              title="Change Password"
                              onClick={() => handleOpenPasswordDialog(cu)}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Delete */}
                          <Button
                            variant="ghost" size="sm"
                            className="text-destructive hover:text-destructive"
                            title="Remove access"
                            onClick={() => handleDeleteClientUser(cu)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {clientUsers.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {clientUsers.length} client user{clientUsers.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>

      {/* ── Dialog: Change Password ─────────────────────────────────────── */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Changing password for:</p>
              <p className="font-medium">{selectedUserForPassword?.email}</p>
              <p className="text-sm text-muted-foreground">{selectedUserForPassword?.client_name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <Button
                  type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            </div>
            <Button onClick={handleUpdatePassword} className="w-full" disabled={isUpdatingPassword || !newPassword}>
              {isUpdatingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Manage Permissions ───────────────────────────────────── */}
      <Dialog open={isPermsDialogOpen} onOpenChange={setIsPermsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />Portal Permissions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Managing permissions for:</p>
              <p className="font-medium">{selectedUserForPerms?.email}</p>
              <p className="text-sm text-muted-foreground">{selectedUserForPerms?.client_name}</p>
            </div>
            {selectedUserForPerms?.client_id && (
              <PortalPermissionsManager clientId={selectedUserForPerms.client_id} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
