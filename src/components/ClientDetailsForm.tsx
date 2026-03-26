import { useState } from 'react';
import { ClientDetails } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ClientDetailsFormProps {
  onSubmit: (details: ClientDetails, invoiceNumber: string) => void;
  isGenerating: boolean;
}

export const ClientDetailsForm = ({ onSubmit, isGenerating }: ClientDetailsFormProps) => {
  const [companyName, setCompanyName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const date = new Date();
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-001`;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postcode.trim()) newErrors.postcode = 'Postcode is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(
      {
        companyName: companyName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        postcode: postcode.trim(),
        country: country.trim(),
      },
      invoiceNumber.trim()
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Generate PDF Invoice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-20240101-001"
                className={errors.invoiceNumber ? 'border-destructive' : ''}
              />
              {errors.invoiceNumber && (
                <p className="text-xs text-destructive mt-1">{errors.invoiceNumber}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="companyName">Client Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Client Company Ltd"
                className={errors.companyName ? 'border-destructive' : ''}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive mt-1">{errors.companyName}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="123 Business Street"
                className={errors.addressLine1 ? 'border-destructive' : ''}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-destructive mt-1">{errors.addressLine1}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Suite 100"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="London"
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-xs text-destructive mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="SW1A 1AA"
                className={errors.postcode ? 'border-destructive' : ''}
              />
              {errors.postcode && (
                <p className="text-xs text-destructive mt-1">{errors.postcode}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United Kingdom"
                className={errors.country ? 'border-destructive' : ''}
              />
              {errors.country && (
                <p className="text-xs text-destructive mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isGenerating}>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating PDF...' : 'Generate PDF Invoice'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
