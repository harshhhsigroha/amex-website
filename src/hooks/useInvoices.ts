import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbInvoice, ClientSnapshot } from '@/types/database';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface InvoiceFilters {
  financialYear?: string;
  financialWeek?: number;
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

function parseClientSnapshot(json: Json): ClientSnapshot {
  const obj = json as Record<string, unknown>;
  return {
    company_name: String(obj.company_name || ''),
    address_line_1: String(obj.address_line_1 || ''),
    address_line_2: obj.address_line_2 ? String(obj.address_line_2) : undefined,
    city: String(obj.city || ''),
    postcode: String(obj.postcode || ''),
    country: String(obj.country || ''),
  };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<DbInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceFilters>({});

  const fetchInvoices = useCallback(async (filterParams: InvoiceFilters = {}) => {
    setIsLoading(true);
    let query = supabase
      .from('invoices')
      .select('*')
      .order('financial_year', { ascending: false })
      .order('financial_week', { ascending: false })
      .order('created_at', { ascending: false });

    if (filterParams.financialYear) {
      query = query.eq('financial_year', filterParams.financialYear);
    }
    if (filterParams.financialWeek) {
      query = query.eq('financial_week', filterParams.financialWeek);
    }
    if (filterParams.clientId) {
      query = query.eq('client_id', filterParams.clientId);
    }
    if (filterParams.startDate) {
      query = query.gte('invoice_date', filterParams.startDate);
    }
    if (filterParams.endDate) {
      query = query.lte('invoice_date', filterParams.endDate);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load invoices');
      console.error('Error fetching invoices:', error);
    } else {
      const typedData: DbInvoice[] = (data || []).map(inv => ({
        ...inv,
        client_snapshot: parseClientSnapshot(inv.client_snapshot),
      }));
      setInvoices(typedData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchInvoices(filters);
  }, [fetchInvoices, filters]);

  const addInvoice = useCallback(async (invoice: Omit<DbInvoice, 'id' | 'created_at'>) => {
    const insertData = {
      ...invoice,
      client_snapshot: invoice.client_snapshot as unknown as Json,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Invoice number already exists');
      } else {
        toast.error('Failed to save invoice');
        console.error('Error adding invoice:', error);
      }
      return { success: false, data: null };
    }

    const typedData: DbInvoice = {
      ...data,
      client_snapshot: parseClientSnapshot(data.client_snapshot),
    };

    setInvoices(prev => [typedData, ...prev]);
    toast.success('Invoice saved');
    return { success: true, data: typedData };
  }, []);

  const getFinancialYears = useCallback(() => {
    const years = new Set(invoices.map(inv => inv.financial_year));
    return Array.from(years).sort().reverse();
  }, [invoices]);

  const getFinancialWeeks = useCallback((year?: string) => {
    const filtered = year ? invoices.filter(inv => inv.financial_year === year) : invoices;
    const weeks = new Set(filtered.map(inv => inv.financial_week));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [invoices]);

  return {
    invoices,
    isLoading,
    addInvoice,
    filters,
    setFilters,
    refetch: () => fetchInvoices(filters),
    getFinancialYears,
    getFinancialWeeks,
  };
}
