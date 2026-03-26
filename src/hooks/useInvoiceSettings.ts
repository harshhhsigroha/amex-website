import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceSettings {
  id: string;
  // Master Invoice Payment Details
  bank_name: string;
  sort_code: string;
  account_number: string;
  remittance_email: string;
  vat_number: string;
  // Self-Bill Invoice To Address
  self_bill_company_name: string;
  self_bill_address_line1: string;
  self_bill_address_line2: string;
  self_bill_city: string;
  self_bill_postcode: string;
}

export const DEFAULT_INVOICE_SETTINGS: Omit<InvoiceSettings, 'id'> = {
  bank_name: 'AMEX Outsourcing',
  sort_code: '04-06-05',
  account_number: '2197155',
  remittance_email: 'accounts@amexoutsourcing.com',
  vat_number: 'GB 123456789',
  self_bill_company_name: 'AMEX Outsourcing',
  self_bill_address_line1: 'Suite 8 Pemberton House',
  self_bill_address_line2: 'Stafford Park 1',
  self_bill_city: 'Telford',
  self_bill_postcode: 'TF3 3BD',
};

export function useInvoiceSettings() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as InvoiceSettings | null);
    } catch (err) {
      console.error('Failed to fetch invoice settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (updates: Omit<InvoiceSettings, 'id'>) => {
    setIsSaving(true);
    try {
      if (settings) {
        // Update existing row
        const { error } = await supabase
          .from('invoice_settings')
          .update(updates)
          .eq('id', settings.id);
        if (error) throw error;
        setSettings({ ...settings, ...updates });
      } else {
        // Insert new row
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert(updates)
          .select()
          .single();
        if (error) throw error;
        setSettings(data as InvoiceSettings);
      }
      toast.success('Settings saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error('Failed to save settings', { description: message });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // Effective settings — falls back to defaults if DB not loaded yet
  const effectiveSettings: Omit<InvoiceSettings, 'id'> = settings
    ? {
        bank_name: settings.bank_name,
        sort_code: settings.sort_code,
        account_number: settings.account_number,
        remittance_email: settings.remittance_email,
        vat_number: settings.vat_number,
        self_bill_company_name: settings.self_bill_company_name,
        self_bill_address_line1: settings.self_bill_address_line1,
        self_bill_address_line2: settings.self_bill_address_line2,
        self_bill_city: settings.self_bill_city,
        self_bill_postcode: settings.self_bill_postcode,
      }
    : DEFAULT_INVOICE_SETTINGS;

  return { settings, effectiveSettings, isLoading, isSaving, saveSettings, refetch: fetchSettings };
}
