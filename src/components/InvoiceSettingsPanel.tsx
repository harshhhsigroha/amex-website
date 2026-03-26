import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings2, CreditCard, MapPin } from 'lucide-react';
import { useInvoiceSettings, DEFAULT_INVOICE_SETTINGS } from '@/hooks/useInvoiceSettings';

export function InvoiceSettingsPanel() {
  const { settings, isLoading, isSaving, saveSettings } = useInvoiceSettings();

  const [form, setForm] = useState(DEFAULT_INVOICE_SETTINGS);

  useEffect(() => {
    if (settings) {
      setForm({
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
      });
    }
  }, [settings]);

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    await saveSettings(form);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Invoice Settings
        </CardTitle>
        <CardDescription>
          Configure the payment details shown on master invoices and the "Self Billing Invoice To" address on self-billed invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* ── Master Invoice Payment Details ─────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Master Invoice — Payment Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={form.bank_name}
                onChange={e => update('bank_name', e.target.value)}
                placeholder="AMEX Outsourcing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_code">Sort Code</Label>
              <Input
                id="sort_code"
                value={form.sort_code}
                onChange={e => update('sort_code', e.target.value)}
                placeholder="04-06-05"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={form.account_number}
                onChange={e => update('account_number', e.target.value)}
                placeholder="2197155"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">VAT Number</Label>
              <Input
                id="vat_number"
                value={form.vat_number}
                onChange={e => update('vat_number', e.target.value)}
                placeholder="GB 123456789"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remittance_email">Remittance Email</Label>
              <Input
                id="remittance_email"
                type="email"
                value={form.remittance_email}
                onChange={e => update('remittance_email', e.target.value)}
                placeholder="accounts@amexoutsourcing.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Self-Bill Invoice To Address ───────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Self-Bill Invoice — "Invoice To" Address
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="self_bill_company_name">Company Name</Label>
              <Input
                id="self_bill_company_name"
                value={form.self_bill_company_name}
                onChange={e => update('self_bill_company_name', e.target.value)}
                placeholder="AMEX Outsourcing"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="self_bill_address_line1">Address Line 1</Label>
              <Input
                id="self_bill_address_line1"
                value={form.self_bill_address_line1}
                onChange={e => update('self_bill_address_line1', e.target.value)}
                placeholder="Suite 8 Pemberton House"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="self_bill_address_line2">Address Line 2</Label>
              <Input
                id="self_bill_address_line2"
                value={form.self_bill_address_line2}
                onChange={e => update('self_bill_address_line2', e.target.value)}
                placeholder="Stafford Park 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="self_bill_city">City</Label>
              <Input
                id="self_bill_city"
                value={form.self_bill_city}
                onChange={e => update('self_bill_city', e.target.value)}
                placeholder="Telford"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="self_bill_postcode">Postcode</Label>
              <Input
                id="self_bill_postcode"
                value={form.self_bill_postcode}
                onChange={e => update('self_bill_postcode', e.target.value)}
                placeholder="TF3 3BD"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
