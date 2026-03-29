import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PortalPermissions {
  can_view_dashboard: boolean;
  can_view_invoices: boolean;
  can_view_contractors: boolean;
  can_view_support: boolean;
  can_view_files: boolean;
}

const DEFAULT_PERMISSIONS: PortalPermissions = {
  can_view_dashboard: true,
  can_view_invoices: true,
  can_view_contractors: true,
  can_view_support: true,
  can_view_files: false,
};

export function usePortalPermissions(clientId: string | null) {
  const [permissions, setPermissions] = useState<PortalPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!clientId) {
      setPermissions(DEFAULT_PERMISSIONS);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('portal_permissions')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching portal permissions:', error);
      setPermissions(DEFAULT_PERMISSIONS);
    } else if (data) {
      setPermissions({
        can_view_dashboard: data.can_view_dashboard,
        can_view_invoices: data.can_view_invoices,
        can_view_contractors: data.can_view_contractors,
        can_view_support: data.can_view_support,
        can_view_files: data.can_view_files,
      });
    } else {
      // No record = use defaults (all visible)
      setPermissions(DEFAULT_PERMISSIONS);
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, refetch: fetchPermissions };
}
