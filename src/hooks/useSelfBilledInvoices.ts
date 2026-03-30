import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SelfBilledInvoice, CandidateSnapshot, SelfBillLineItem } from '@/types/candidate';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface SelfBillFilters {
  financialYear: string;
  financialWeek: number | null;
  empId: string;
}

export function useSelfBilledInvoices() {
  const { user, isClient, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<SelfBilledInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myClientId, setMyClientId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SelfBillFilters>({
    financialYear: '',
    financialWeek: null,
    empId: '',
  });

  // Resolve client_id for ops-portal users
  useEffect(() => {
    if (!isClient || !user) return;
    supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setMyClientId(data?.client_id ?? null));
  }, [isClient, user]);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('self_billed_invoices')
        .select('*')
        .order('financial_year', { ascending: false })
        .order('financial_week', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.financialYear) {
        query = query.eq('financial_year', filters.financialYear);
      }
      if (filters.financialWeek !== null) {
        query = query.eq('financial_week', filters.financialWeek);
      }
      if (filters.empId) {
        query = query.ilike('emp_id', `%${filters.empId}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Transform the data to match our interface
      const transformedData: SelfBilledInvoice[] = (data || []).map(item => ({
        ...item,
        candidate_snapshot: item.candidate_snapshot as unknown as CandidateSnapshot,
        line_items: item.line_items as unknown as SelfBillLineItem[],
      }));
      
      setInvoices(transformedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch self-billed invoices';
      setError(message);
      toast.error('Failed to load self-billed invoices', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = useCallback(async (
    invoice: Omit<SelfBilledInvoice, 'id' | 'created_at'>
  ): Promise<void> => {
    try {
      const insertData: Record<string, unknown> = {
        emp_id: invoice.emp_id,
        candidate_snapshot: invoice.candidate_snapshot as unknown,
        remittance_number: invoice.remittance_number,
        payment_date: invoice.payment_date,
        financial_year: invoice.financial_year,
        financial_week: invoice.financial_week,
        net_total: invoice.net_total,
        deductions: invoice.deductions,
        total_to_pay: invoice.total_to_pay,
        line_items: invoice.line_items as unknown,
        pdf_filename: invoice.pdf_filename,
      };

      // Include client_id so the new RLS policy allows the insert and
      // ensures data is properly isolated per agency (UK GDPR data minimisation)
      if (isClient && myClientId) {
        insertData.client_id = myClientId;
      }
      
      const { error: insertError } = await supabase
        .from('self_billed_invoices')
        .insert(insertData as never);

      if (insertError) throw insertError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save self-billed invoice';
      toast.error('Failed to save invoice', { description: message });
      throw err;
    }
  }, [isClient, myClientId]);

  const getNextRemittanceNumber = useCallback(async (): Promise<string> => {
    try {
      const { data } = await supabase
        .from('self_billed_invoices')
        .select('remittance_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        // Extract number from format REM-XXXXXX
        const match = data[0].remittance_number.match(/REM-(\d+)/);
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1;
          return `REM-${String(nextNum).padStart(6, '0')}`;
        }
      }
      
      return 'REM-000001';
    } catch {
      return `REM-${Date.now()}`;
    }
  }, []);

  const getFinancialYears = useCallback((): string[] => {
    const years = new Set(invoices.map(inv => inv.financial_year));
    return Array.from(years).sort().reverse();
  }, [invoices]);

  const getFinancialWeeks = useCallback((year: string): number[] => {
    const weeks = invoices
      .filter(inv => inv.financial_year === year)
      .map(inv => inv.financial_week);
    return Array.from(new Set(weeks)).sort((a, b) => a - b);
  }, [invoices]);

  return {
    invoices,
    isLoading,
    error,
    filters,
    setFilters,
    addInvoice,
    getNextRemittanceNumber,
    getFinancialYears,
    getFinancialWeeks,
    refreshInvoices: fetchInvoices,
  };
}
