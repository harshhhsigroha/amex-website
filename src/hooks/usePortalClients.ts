/**
 * usePortalClients
 * For a client user, fetches the end-clients (portal_users)
 * linked to their client_id, exposing them as selectable DbClient-like records.
 *
 * Each end-client's "company" is their full_name, email, and their
 * client_id (Tony's company) — so invoices are billed to them via the portal_users link.
 *
 * The hook returns PortalClient objects that include profile info (name/email)
 * as well as the underlying client_id they belong to.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PortalClient {
  id: string;          // portal_users.id — used as the "client" selection key
  user_id: string;     // the end-client's auth user id
  client_id: string;   // Tony's client_id (the agency's clients table row)
  full_name: string | null;
  email: string;
  created_at: string;
}

export function usePortalClients() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [portalClients, setPortalClients] = useState<PortalClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortalClients = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // 1. Resolve Tony's client_id
    const { data: link } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const resolvedClientId = link?.client_id ?? null;
    setClientId(resolvedClientId);

    if (!resolvedClientId) {
      setIsLoading(false);
      return;
    }

    // 2. Fetch portal_users for this client
    const { data: links, error } = await supabase
      .from('portal_users')
      .select('id, user_id, client_id, created_at')
      .eq('client_id', resolvedClientId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load end-clients');
      setIsLoading(false);
      return;
    }

    if (!links || links.length === 0) {
      setPortalClients([]);
      setIsLoading(false);
      return;
    }

    // 3. Fetch profiles for each portal user
    const userIds = links.map(l => l.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const result: PortalClient[] = links.map(l => ({
      id: l.id,
      user_id: l.user_id,
      client_id: l.client_id,
      full_name: profiles?.find(p => p.id === l.user_id)?.full_name ?? null,
      email: profiles?.find(p => p.id === l.user_id)?.email ?? '',
      created_at: l.created_at,
    }));

    setPortalClients(result);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPortalClients();
  }, [fetchPortalClients]);

  return { portalClients, clientId, isLoading, refetch: fetchPortalClients };
}
