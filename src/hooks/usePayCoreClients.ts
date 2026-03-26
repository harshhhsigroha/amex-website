import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientPlan {
  id: string;
  client_id: string;
  plan_name: string;
  plan_tier: string;
  monthly_fee: number;
  billing_cycle: string;
  status: string;
  trial_ends_at: string | null;
  next_billing_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientBillingRecord {
  id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  description: string | null;
  created_at: string;
}

export interface ClientWhiteLabel {
  id: string;
  client_id: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_domain: string | null;
  enabled: boolean;
  hide_powered_by: boolean;
}

export function useClientPlans(clientId?: string) {
  const qc = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['client_plans', clientId],
    queryFn: async () => {
      let q = supabase.from('client_plans').select('*').order('created_at', { ascending: false });
      if (clientId) q = q.eq('client_id', clientId);
      const { data, error } = await q;
      if (error) throw error;
      return data as ClientPlan[];
    },
  });

  const upsertPlan = useMutation({
    mutationFn: async (plan: Partial<ClientPlan> & { client_id: string }) => {
      if (plan.id) {
        const { error } = await supabase.from('client_plans').update(plan).eq('id', plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('client_plans').insert(plan);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_plans'] });
      toast.success('Plan saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { plans, isLoading, upsertPlan: upsertPlan.mutate };
}

export function useClientBilling(clientId?: string) {
  const qc = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['client_billing', clientId],
    queryFn: async () => {
      let q = supabase.from('client_billing_records').select('*').order('due_date', { ascending: false });
      if (clientId) q = q.eq('client_id', clientId);
      const { data, error } = await q;
      if (error) throw error;
      return data as ClientBillingRecord[];
    },
  });

  const addRecord = useMutation({
    mutationFn: async (record: Omit<ClientBillingRecord, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('client_billing_records').insert(record);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_billing'] });
      toast.success('Billing record added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientBillingRecord> & { id: string }) => {
      const { error } = await supabase.from('client_billing_records').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_billing'] });
      toast.success('Record updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { records, isLoading, addRecord: addRecord.mutate, updateRecord: updateRecord.mutate };
}

export function useClientWhiteLabel(clientId?: string) {
  const qc = useQueryClient();

  const { data: whiteLabel, isLoading } = useQuery({
    queryKey: ['client_white_label', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from('client_white_label')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      if (error) throw error;
      return data as ClientWhiteLabel | null;
    },
    enabled: !!clientId,
  });

  const saveWhiteLabel = useMutation({
    mutationFn: async (wl: Partial<ClientWhiteLabel> & { client_id: string }) => {
      const { error } = await supabase
        .from('client_white_label')
        .upsert({ ...wl }, { onConflict: 'client_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_white_label'] });
      toast.success('White label settings saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { whiteLabel, isLoading, saveWhiteLabel: saveWhiteLabel.mutate };
}
