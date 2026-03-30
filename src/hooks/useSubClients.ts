/**
 * useSubClients
 * For a client user, fetches and manages the sub-clients they own
 * (clients where parent_client_id = their client_id).
 * These are the recipients they can address invoices to.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DbClient } from '@/types/database';
import { toast } from 'sonner';

export function useSubClients() {
  const { user } = useAuth();
  const [subClients, setSubClients] = useState<DbClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubClients = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch sub-clients - RLS ensures only Tony's sub-clients are returned
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .not('parent_client_id', 'is', null)
      .order('company_name');

    if (error) {
      toast.error('Failed to load your clients');
      console.error('Error fetching sub-clients:', error);
    } else {
      setSubClients((data as DbClient[]) || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubClients();
  }, [fetchSubClients]);

  const addSubClient = useCallback(async (
    client: Omit<DbClient, 'id' | 'created_at' | 'updated_at'>,
    parentClientId: string
  ) => {
    // Check for duplicate
    const existing = subClients.find(
      c =>
        c.company_name.toLowerCase() === client.company_name.toLowerCase() &&
        c.postcode.toLowerCase() === client.postcode.toLowerCase()
    );

    if (existing) {
      toast.error('Client already exists', {
        description: 'A client with this company name and postcode already exists',
      });
      return { success: false, data: existing };
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, parent_client_id: parentClientId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Client already exists');
      } else {
        toast.error('Failed to save client');
        console.error('Error adding sub-client:', error);
      }
      return { success: false, data: null };
    }

    setSubClients(prev =>
      [...prev, data as DbClient].sort((a, b) =>
        a.company_name.localeCompare(b.company_name)
      )
    );
    toast.success('Client saved');
    return { success: true, data: data as DbClient };
  }, [subClients]);

  const updateSubClient = useCallback(async (id: string, updates: Partial<DbClient>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update client');
      console.error('Error updating sub-client:', error);
      return { success: false, data: null };
    }

    setSubClients(prev => prev.map(c => (c.id === id ? (data as DbClient) : c)));
    toast.success('Client updated');
    return { success: true, data: data as DbClient };
  }, []);

  return {
    subClients,
    isLoading,
    addSubClient,
    updateSubClient,
    refetch: fetchSubClients,
  };
}
