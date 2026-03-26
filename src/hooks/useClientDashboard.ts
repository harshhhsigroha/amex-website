import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbInvoice, DbClient, ClientSnapshot } from '@/types/database';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  emp_id: string;
  firstname: string;
  surname: string;
  timesheet_id: string | null;
  hours: number;
  pay_rate: number;
  pay_amount: number;
  vat: number;
  total: number;
  umbrella_company: string | null;
  start_date: string;
  end_date: string;
  pay_date: string | null;
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

export function useClientDashboard() {
  const [client, setClient] = useState<DbClient | null>(null);
  const [invoices, setInvoices] = useState<DbInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientData = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch client record (RLS will filter to only the user's client)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      toast.error('Failed to load client data');
    } else if (clientData) {
      setClient(clientData);
    }

    // Fetch invoices (RLS will filter to only client's invoices)
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      toast.error('Failed to load invoices');
    } else {
      const typedData: DbInvoice[] = (invoicesData || []).map(inv => ({
        ...inv,
        client_snapshot: parseClientSnapshot(inv.client_snapshot),
      }));
      setInvoices(typedData);
    }

    setIsLoading(false);
  }, []);

  const fetchInvoiceLineItems = useCallback(async (invoiceId: string): Promise<InvoiceLineItem[]> => {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('surname', { ascending: true });

    if (error) {
      console.error('Error fetching line items:', error);
      return [];
    }

    return data as InvoiceLineItem[];
  }, []);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  // Calculate analytics
  const getAnalytics = useCallback(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
    const totalVat = invoices.reduce((sum, inv) => sum + Number(inv.total_vat), 0);
    const totalGross = invoices.reduce((sum, inv) => sum + Number(inv.total_gross), 0);
    const totalContractors = invoices.reduce((sum, inv) => sum + inv.total_contractors, 0);
    
    // Group by financial year
    const byYear = invoices.reduce((acc, inv) => {
      const year = inv.financial_year;
      if (!acc[year]) {
        acc[year] = { total: 0, count: 0 };
      }
      acc[year].total += Number(inv.grand_total);
      acc[year].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Group by month
    const byMonth = invoices.reduce((acc, inv) => {
      const date = new Date(inv.invoice_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, count: 0 };
      }
      acc[monthKey].total += Number(inv.grand_total);
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      totalRevenue,
      totalVat,
      totalGross,
      totalContractors,
      invoiceCount: invoices.length,
      byYear,
      byMonth,
    };
  }, [invoices]);

  // Get unique candidates from invoices (via line items would be better, but this is a fallback)
  const getLinkedCandidates = useCallback(async () => {
    const invoiceIds = invoices.map(inv => inv.id);
    if (invoiceIds.length === 0) return [];

    const { data, error } = await supabase
      .from('invoice_line_items')
      .select('emp_id, firstname, surname')
      .in('invoice_id', invoiceIds);

    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }

    // Deduplicate by emp_id
    const uniqueMap = new Map<string, { emp_id: string; firstname: string; surname: string }>();
    (data || []).forEach(item => {
      if (!uniqueMap.has(item.emp_id)) {
        uniqueMap.set(item.emp_id, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [invoices]);

  return {
    client,
    invoices,
    isLoading,
    fetchInvoiceLineItems,
    getAnalytics,
    getLinkedCandidates,
    refetch: fetchClientData,
  };
}
