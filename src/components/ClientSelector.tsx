import { useState, useMemo } from 'react';
import { DbClient } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Edit2, X } from 'lucide-react';

interface ClientSelectorProps {
  clients: DbClient[];
  selectedClient: DbClient | null;
  onSelectClient: (client: DbClient | null) => void;
  onSaveNewClient: (client: Omit<DbClient, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data: DbClient | null }>;
  onUpdateClient: (id: string, updates: Partial<DbClient>) => Promise<{ success: boolean; data: DbClient | null }>;
  isLoading: boolean;
  /** When true, shows "Your Clients" labels instead of generic "Client" labels */
  isClientMode?: boolean;
}

export const ClientSelector = ({
  clients,
  selectedClient,
  onSelectClient,
  onSaveNewClient,
  onUpdateClient,
  isLoading,
  isClientMode = false,
}: ClientSelectorProps) => {
  const [mode, setMode] = useState<'select' | 'new' | 'edit'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      c => c.company_name.toLowerCase().includes(term) ||
           c.postcode.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Required';
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.postcode.trim()) newErrors.postcode = 'Required';
    if (!formData.country.trim()) newErrors.country = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    onSelectClient(client || null);
    setSearchTerm('');
  };

  const handleStartNew = () => {
    setMode('new');
    setFormData({
      company_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
    });
    setErrors({});
  };

  const handleStartEdit = () => {
    if (!selectedClient) return;
    setMode('edit');
    setFormData({
      company_name: selectedClient.company_name,
      address_line_1: selectedClient.address_line_1,
      address_line_2: selectedClient.address_line_2 || '',
      city: selectedClient.city,
      postcode: selectedClient.postcode,
      country: selectedClient.country,
    });
    setErrors({});
  };

  const handleCancel = () => {
    setMode('select');
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);

    if (mode === 'new') {
      const result = await onSaveNewClient({
        company_name: formData.company_name.trim(),
        address_line_1: formData.address_line_1.trim(),
        address_line_2: formData.address_line_2.trim() || null,
        city: formData.city.trim(),
        postcode: formData.postcode.trim(),
        country: formData.country.trim(),
      });
      if (result.success && result.data) {
        onSelectClient(result.data);
        setMode('select');
      }
    } else if (mode === 'edit' && selectedClient) {
      const result = await onUpdateClient(selectedClient.id, {
        company_name: formData.company_name.trim(),
        address_line_1: formData.address_line_1.trim(),
        address_line_2: formData.address_line_2.trim() || null,
        city: formData.city.trim(),
        postcode: formData.postcode.trim(),
        country: formData.country.trim(),
      });
      if (result.success && result.data) {
        onSelectClient(result.data);
        setMode('select');
      }
    }

    setIsSaving(false);
  };

  const renderForm = () => (
    <div className="space-y-3">
      <div>
        <Label htmlFor="company_name" className="text-xs">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
          className={`h-9 ${errors.company_name ? 'border-destructive' : ''}`}
          disabled={mode === 'edit'}
        />
        {errors.company_name && <p className="text-xs text-destructive mt-0.5">{errors.company_name}</p>}
      </div>
      <div>
        <Label htmlFor="address_line_1" className="text-xs">Address Line 1</Label>
        <Input
          id="address_line_1"
          value={formData.address_line_1}
          onChange={(e) => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))}
          className={`h-9 ${errors.address_line_1 ? 'border-destructive' : ''}`}
        />
      </div>
      <div>
        <Label htmlFor="address_line_2" className="text-xs">Address Line 2 (Optional)</Label>
        <Input
          id="address_line_2"
          value={formData.address_line_2}
          onChange={(e) => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))}
          className="h-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-xs">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className={`h-9 ${errors.city ? 'border-destructive' : ''}`}
          />
        </div>
        <div>
          <Label htmlFor="postcode" className="text-xs">Postcode</Label>
          <Input
            id="postcode"
            value={formData.postcode}
            onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
            className={`h-9 ${errors.postcode ? 'border-destructive' : ''}`}
            disabled={mode === 'edit'}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="country" className="text-xs">Country</Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          className={`h-9 ${errors.country ? 'border-destructive' : ''}`}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? 'Saving...' : mode === 'new' ? 'Save Client' : 'Update Client'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          {mode === 'select'
            ? (isClientMode ? 'Select Your Client' : 'Select Client')
            : mode === 'new'
            ? (isClientMode ? 'New Client' : 'New Client')
            : 'Edit Client'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mode === 'select' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedClient?.id || ''}
                  onValueChange={handleSelectClient}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder={isLoading ? 'Loading...' : 'Select a client'} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <div className="p-2 border-b border-border">
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredClients.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No clients found
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <span className="font-medium">{client.company_name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {client.postcode}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleStartNew} className="h-9">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedClient && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex justify-between items-start">
                  <div className="text-sm">
                    <p className="font-semibold">{selectedClient.company_name}</p>
                    <p className="text-muted-foreground">{selectedClient.address_line_1}</p>
                    {selectedClient.address_line_2 && (
                      <p className="text-muted-foreground">{selectedClient.address_line_2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {selectedClient.city}, {selectedClient.postcode}
                    </p>
                    <p className="text-muted-foreground">{selectedClient.country}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          renderForm()
        )}
      </CardContent>
    </Card>
  );
};
