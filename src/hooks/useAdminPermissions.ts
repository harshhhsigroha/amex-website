import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminPermissions {
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

const ALL_PERMISSIONS: AdminPermissions = {
  can_manage_clients: true,
  can_manage_candidates: true,
  can_generate_invoices: true,
  can_generate_self_bills: true,
  can_view_history: true,
  can_view_dashboard: true,
};

export function useAdminPermissions() {
  const { user, isSuperAdmin, isAdmin, isClient } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions(DEFAULT_PERMISSIONS);
      setLoading(false);
      return;
    }

    // Super admins have all permissions
    if (isSuperAdmin) {
      setPermissions(ALL_PERMISSIONS);
      setLoading(false);
      return;
    }

    // AMEX team admins — fetch from admin_permissions
    if (isAdmin) {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin permissions:', error);
        setPermissions(DEFAULT_PERMISSIONS);
      } else if (data) {
        setPermissions({
          can_manage_clients: data.can_manage_clients,
          can_manage_candidates: data.can_manage_candidates,
          can_generate_invoices: data.can_generate_invoices,
          can_generate_self_bills: data.can_generate_self_bills,
          can_view_history: data.can_view_history,
          can_view_dashboard: data.can_view_dashboard,
        });
      } else {
        setPermissions(DEFAULT_PERMISSIONS);
      }

      setLoading(false);
      return;
    }

    // AMEX Outsourcing clients — fetch from client_permissions via their client_id
    if (isClient) {
      // First get the client_id for this user
      const { data: clientLink } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientLink) {
        setPermissions(DEFAULT_PERMISSIONS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('client_permissions')
        .select('*')
        .eq('client_id', clientLink.client_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client permissions:', error);
        setPermissions(DEFAULT_PERMISSIONS);
      } else if (data) {
        setPermissions({
          can_manage_clients: false, // clients never manage clients
          can_manage_candidates: data.can_manage_candidates,
          can_generate_invoices: data.can_generate_invoices,
          can_generate_self_bills: data.can_generate_self_bills,
          can_view_history: data.can_view_history,
          can_view_dashboard: data.can_view_dashboard,
        });
      } else {
        // No permissions record = no access yet
        setPermissions(DEFAULT_PERMISSIONS);
      }

      setLoading(false);
      return;
    }

    setPermissions(DEFAULT_PERMISSIONS);
    setLoading(false);
  }, [user, isSuperAdmin, isAdmin, isClient]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
    if (isSuperAdmin) return true;
    return permissions[permission];
  }, [isSuperAdmin, permissions]);

  const hasAnyPermission = useCallback((): boolean => {
    if (isSuperAdmin) return true;
    return Object.values(permissions).some(v => v);
  }, [isSuperAdmin, permissions]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    refetch: fetchPermissions,
  };
}
