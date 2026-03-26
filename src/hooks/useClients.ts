import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbClient } from '@/types/database';
import { toast } from 'sonner';

export function useClients() {
  const [clients, setClients] = useState<DbClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .is('parent_client_id', null)  // Only top-level PayCore clients, not sub-clients
      .order('company_name');

    if (error) {
      toast.error('Failed to load clients');
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (client: Omit<DbClient, 'id' | 'created_at' | 'updated_at'>) => {
    // Check for duplicate
    const existing = clients.find(
      c => c.company_name.toLowerCase() === client.company_name.toLowerCase() &&
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
      .insert(client)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Client already exists');
      } else {
        toast.error('Failed to save client');
        console.error('Error adding client:', error);
      }
      return { success: false, data: null };
    }

    setClients(prev => [...prev, data].sort((a, b) => a.company_name.localeCompare(b.company_name)));
    toast.success('Client saved');
    return { success: true, data };
  }, [clients]);

  const updateClient = useCallback(async (id: string, updates: Partial<DbClient>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update client');
      console.error('Error updating client:', error);
      return { success: false, data: null };
    }

    setClients(prev => prev.map(c => c.id === id ? data : c));
    toast.success('Client updated');
    return { success: true, data };
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    // First, delete any associated client_users
    const { error: linkError } = await supabase
      .from('client_users')
      .delete()
      .eq('client_id', id);

    if (linkError) {
      console.error('Error deleting client users:', linkError);
      // Continue anyway - the client might not have portal users
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete client', {
        description: error.message.includes('violates foreign key')
          ? 'This client has invoices and cannot be deleted'
          : error.message,
      });
      console.error('Error deleting client:', error);
      return { success: false };
    }

    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Client deleted');
    return { success: true };
  }, []);

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}
