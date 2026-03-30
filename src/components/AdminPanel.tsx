import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';
import { ClientUserManagement } from '@/components/ClientUserManagement';
import ClearHistoryButton from '@/components/ClearHistoryButton';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Shield, ShieldCheck, Trash2, Edit, Settings } from 'lucide-react';


type AppRole = 'super_admin' | 'admin';

interface AdminPermissions {
  can_manage_clients: boolean;
  can_manage_candidates: boolean;
  can_generate_invoices: boolean;
  can_generate_self_bills: boolean;
  can_view_history: boolean;
  can_view_dashboard: boolean;
}

const DEFAULT_PERMISSIONS: AdminPermissions = {
  can_manage_clients: false,
  can_manage_candidates: false,
  can_generate_invoices: false,
  can_generate_self_bills: false,
  can_view_history: false,
  can_view_dashboard: false,
};

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
  permissions?: AdminPermissions;
}

export default function AdminPanel() {
  const { user, isSuperAdmin, refreshRole } = useAuth();
  const { clients } = useClients();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: '', fullName: '', password: '', role: 'admin' as AppRole });
  const [permissionsData, setPermissionsData] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    
    // Fetch all user roles with profile info
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch admin users',
      });
      setLoading(false);
      return;
    }

    // Fetch profiles for these users
    const userIds = rolesData.map(r => r.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Fetch permissions for all users
    const { data: permissionsData } = await supabase
      .from('admin_permissions')
      .select('*')
      .in('user_id', userIds);

    // Combine the data
    const combinedData: AdminUser[] = rolesData.map(role => {
      const profile = profilesData.find(p => p.id === role.user_id);
      const perms = permissionsData?.find(p => p.user_id === role.user_id);
      return {
        id: role.id,
        user_id: role.user_id,
        email: profile?.email || 'Unknown',
        full_name: profile?.full_name,
        role: role.role as AppRole,
        created_at: role.created_at,
        permissions: perms ? {
          can_manage_clients: perms.can_manage_clients,
          can_manage_candidates: perms.can_manage_candidates,
          can_generate_invoices: perms.can_generate_invoices,
          can_generate_self_bills: perms.can_generate_self_bills,
          can_view_history: perms.can_view_history,
          can_view_dashboard: perms.can_view_dashboard,
        } : undefined,
      };
    });

    setAdmins(combinedData);
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const handleAddAdmin = async () => {
    if (!formData.email || !formData.fullName || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields (email, full name, and password)',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters' });
      return;
    }

    const hasUpper = /[A-Z]/.test(formData.password);
    const hasLower = /[a-z]/.test(formData.password);
    const hasNum = /[0-9]/.test(formData.password);
    if (!hasUpper || !hasLower || !hasNum) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must contain uppercase, lowercase, and a number' });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      },
    });

    if (error || !data?.success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data?.error || error?.message || 'Failed to create admin user',
      });
    } else {
      setCreatedCredentials({ email: formData.email, password: formData.password });
      toast({
        title: 'Admin Created',
        description: `${formData.email} is now ${formData.role === 'super_admin' ? 'a Super Admin' : 'an Admin'}`,
      });
      setIsAddDialogOpen(false);
      setFormData({ email: '', fullName: '', password: '', role: 'admin' });
      fetchAdmins();
    }

    setIsSubmitting(false);
  };

  const handleUpdateRole = async () => {
    if (!selectedAdmin) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: formData.role })
      .eq('id', selectedAdmin.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update role',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
      
      // Refresh current user's role if they updated themselves
      if (selectedAdmin.user_id === user?.id) {
        refreshRole();
      }
    }

    setIsSubmitting(false);
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', admin.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove admin',
      });
    } else {
      toast({
        title: 'Success',
        description: `${admin.email} is no longer an admin`,
      });
      fetchAdmins();
    }
  };

  const openEditDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({ email: admin.email, fullName: admin.full_name || '', password: '', role: admin.role });
    setIsEditDialogOpen(true);
  };

  const openPermissionsDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setPermissionsData(admin.permissions || DEFAULT_PERMISSIONS);
    setIsPermissionsDialogOpen(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) return;

    setIsSubmitting(true);

    // Check if permissions record exists
    const { data: existing } = await supabase
      .from('admin_permissions')
      .select('id')
      .eq('user_id', selectedAdmin.user_id)
      .maybeSingle();

    let error;
    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('admin_permissions')
        .update(permissionsData)
        .eq('user_id', selectedAdmin.user_id);
      error = updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('admin_permissions')
        .insert({ user_id: selectedAdmin.user_id, ...permissionsData });
      error = insertError;
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update permissions',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
      });
      setIsPermissionsDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    }

    setIsSubmitting(false);
  };

  const countPermissions = (perms?: AdminPermissions): number => {
    if (!perms) return 0;
    return Object.values(perms).filter(v => v).length;
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only Super Admins can manage admin users and permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Admin Management
              </CardTitle>
              <CardDescription>
                Manage admin users and their permissions
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                  <DialogDescription>
                    Enter the email of an existing user to grant admin access.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: AppRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAdmin} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Admin
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No admin users found. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.role === 'super_admin' ? (
                        <span className="text-xs text-muted-foreground">All (6/6)</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {countPermissions(admin.permissions)}/6
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {admin.role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPermissionsDialog(admin)}
                            title="Manage Permissions"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(admin)}
                          disabled={admin.user_id === user?.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={admin.user_id === user?.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove admin access for {admin.email}?
                                They will no longer be able to access the admin dashboard.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveAdmin(admin)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permission Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>Super Admin</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Full access to all features</li>
                <li>• Can add/remove admins</li>
                <li>• Can change admin roles & permissions</li>
                <li>• Can manage client users</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Admin</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• No default permissions</li>
                <li>• Super Admin grants specific permissions:</li>
                <li className="ml-4">- Dashboard access</li>
                <li className="ml-4">- Manage clients</li>
                <li className="ml-4">- Manage candidates</li>
                <li className="ml-4">- Generate invoices</li>
                <li className="ml-4">- Generate self-bills</li>
                <li className="ml-4">- View history</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Set permissions for {selectedAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_view_dashboard"
                  checked={permissionsData.can_view_dashboard}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_view_dashboard: !!checked })
                  }
                />
                <Label htmlFor="can_view_dashboard" className="text-sm font-normal">
                  View Dashboard
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_manage_clients"
                  checked={permissionsData.can_manage_clients}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_manage_clients: !!checked })
                  }
                />
                <Label htmlFor="can_manage_clients" className="text-sm font-normal">
                  Manage Clients
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_manage_candidates"
                  checked={permissionsData.can_manage_candidates}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_manage_candidates: !!checked })
                  }
                />
                <Label htmlFor="can_manage_candidates" className="text-sm font-normal">
                  Manage Candidates
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_generate_invoices"
                  checked={permissionsData.can_generate_invoices}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_generate_invoices: !!checked })
                  }
                />
                <Label htmlFor="can_generate_invoices" className="text-sm font-normal">
                  Generate Master Invoices
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_generate_self_bills"
                  checked={permissionsData.can_generate_self_bills}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_generate_self_bills: !!checked })
                  }
                />
                <Label htmlFor="can_generate_self_bills" className="text-sm font-normal">
                  Generate Self-Billed Invoices
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="can_view_history"
                  checked={permissionsData.can_view_history}
                  onCheckedChange={(checked) =>
                    setPermissionsData({ ...permissionsData, can_view_history: !!checked })
                  }
                />
                <Label htmlFor="can_view_history" className="text-sm font-normal">
                  View Invoice History
                </Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPermissionsData({
                  can_manage_clients: true,
                  can_manage_candidates: true,
                  can_generate_invoices: true,
                  can_generate_self_bills: true,
                  can_view_history: true,
                  can_view_dashboard: true,
                })}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPermissionsData(DEFAULT_PERMISSIONS)}
              >
                Clear All
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: AppRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client User Management */}
      <ClientUserManagement clients={clients} />


      {/* Clear History Section */}
      <ClearHistoryButton />
    </div>
  );
}
