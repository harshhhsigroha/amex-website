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
      .is('parent_client_id', null)  // Only top-level clients, not sub-clients
      .order('company_name');

    if (error) {
      toast.error('Failed to load clients');
      console.error('Error fetching clients:', error);
    } else {
      // Filter out the umbrella company (AMEX Outsourcing) — it's not a client to manage
      const filtered = (data || []).filter(c => c.id !== 'a0000000-0000-0000-0000-000000000001');
      setClients(filtered);
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
    // Delete all dependent records in order before deleting the client

    // 1. Delete invoice line items for this client's invoices
    const { data: clientInvoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('client_id', id);

    if (clientInvoices && clientInvoices.length > 0) {
      const invoiceIds = clientInvoices.map(inv => inv.id);
      await supabase.from('invoice_line_items').delete().in('invoice_id', invoiceIds);
      await supabase.from('invoices').delete().eq('client_id', id);
    }

    // 2. Delete self-billed invoices
    await supabase.from('self_billed_invoices').delete().eq('client_id', id);

    // 3. Delete timesheets
    await supabase.from('timesheets').delete().eq('client_id', id);

    // 4. Delete time logs
    await supabase.from('time_logs').delete().eq('client_id', id);

    // 5. Delete files
    await supabase.from('files').delete().eq('client_id', id);

    // 6. Delete support tickets & messages for this client
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('client_id', id);

    if (tickets && tickets.length > 0) {
      const ticketIds = tickets.map(t => t.id);
      await supabase.from('support_messages').delete().in('ticket_id', ticketIds);
      await supabase.from('support_tickets').delete().eq('client_id', id);
    }

    // 7. Delete portal users & permissions
    await supabase.from('portal_users').delete().eq('client_id', id);
    await supabase.from('portal_permissions').delete().eq('client_id', id);

    // 8. Delete client config tables
    await supabase.from('client_permissions').delete().eq('client_id', id);
    await supabase.from('client_white_label').delete().eq('client_id', id);
    await supabase.from('client_plans').delete().eq('client_id', id);
    await supabase.from('client_billing_records').delete().eq('client_id', id);
    await supabase.from('client_onboarding_checklist').delete().eq('client_id', id);
    await supabase.from('onboarding_form_config').delete().eq('client_id', id);

    // 9. Delete client_users
    await supabase.from('client_users').delete().eq('client_id', id);

    // 10. Finally delete the client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete client', { description: error.message });
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
