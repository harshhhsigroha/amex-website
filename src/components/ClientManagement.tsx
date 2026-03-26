import { useState } from 'react';
import { DbClient } from '@/types/database';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Building2, History, Edit2, Search, FileText, Calendar, UserPlus, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ClientManagementProps {
  clients: DbClient[];
  isLoading: boolean;
  onAddClient: (client: Omit<DbClient, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data: DbClient | null }>;
  onUpdateClient: (id: string, updates: Partial<DbClient>) => Promise<{ success: boolean; data: DbClient | null }>;
  onDeleteClient: (id: string) => Promise<{ success: boolean }>;
  invoices: Array<{
    id: string;
    invoice_number: string;
    invoice_date: string;
    grand_total: number;
    client_id: string;
    financial_year: string;
    financial_week: number;
  }>;
}

interface ClientFormData {
  company_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postcode: string;
  country: string;
  // Portal user fields
  createPortalUser: boolean;
  portalEmail: string;
  portalPassword: string;
  portalFullName: string;
}

const emptyFormData: ClientFormData = {
  company_name: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  createPortalUser: true,
  portalEmail: '',
  portalPassword: '',
  portalFullName: '',
};

interface ClientFormProps {
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  errors: Record<string, string>;
  onSubmit: () => void;
  submitLabel: string;
  isSaving: boolean;
  showPortalFields?: boolean;
}

const ClientForm = ({ formData, setFormData, errors, onSubmit, submitLabel, isSaving, showPortalFields = false }: ClientFormProps) => (
  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
    <div>
      <Label htmlFor="company_name">Company Name</Label>
      <Input
        id="company_name"
        value={formData.company_name}
        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
        className={errors.company_name ? 'border-destructive' : ''}
      />
      {errors.company_name && <p className="text-xs text-destructive mt-1">{errors.company_name}</p>}
    </div>
    <div>
      <Label htmlFor="address_line_1">Address Line 1</Label>
      <Input
        id="address_line_1"
        value={formData.address_line_1}
        onChange={(e) => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))}
        className={errors.address_line_1 ? 'border-destructive' : ''}
      />
      {errors.address_line_1 && <p className="text-xs text-destructive mt-1">{errors.address_line_1}</p>}
    </div>
    <div>
      <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
      <Input
        id="address_line_2"
        value={formData.address_line_2}
        onChange={(e) => setFormData(prev => ({ ...prev, address_line_2: e.target.value }))}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className={errors.city ? 'border-destructive' : ''}
        />
        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
      </div>
      <div>
        <Label htmlFor="postcode">Postcode</Label>
        <Input
          id="postcode"
          value={formData.postcode}
          onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
          className={errors.postcode ? 'border-destructive' : ''}
        />
        {errors.postcode && <p className="text-xs text-destructive mt-1">{errors.postcode}</p>}
      </div>
    </div>
    <div>
      <Label htmlFor="country">Country</Label>
      <Input
        id="country"
        value={formData.country}
        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
        className={errors.country ? 'border-destructive' : ''}
      />
      {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
    </div>

    {/* Portal User Creation Section */}
    {showPortalFields && (
      <div className="border-t border-border pt-4 mt-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="createPortalUser"
            checked={formData.createPortalUser}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createPortalUser: checked === true }))}
          />
          <Label htmlFor="createPortalUser" className="flex items-center gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4 text-primary" />
            Create Client Portal Login
          </Label>
        </div>

        {formData.createPortalUser && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Create login credentials for the client to access their portal via the Client Login on the landing page.
            </p>
            <div>
              <Label htmlFor="portalFullName">Full Name</Label>
              <Input
                id="portalFullName"
                value={formData.portalFullName}
                onChange={(e) => setFormData(prev => ({ ...prev, portalFullName: e.target.value }))}
                placeholder="John Smith"
                className={errors.portalFullName ? 'border-destructive' : ''}
              />
              {errors.portalFullName && <p className="text-xs text-destructive mt-1">{errors.portalFullName}</p>}
            </div>
            <div>
              <Label htmlFor="portalEmail">Email</Label>
              <Input
                id="portalEmail"
                type="email"
                value={formData.portalEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, portalEmail: e.target.value }))}
                placeholder="client@company.com"
                className={errors.portalEmail ? 'border-destructive' : ''}
              />
              {errors.portalEmail && <p className="text-xs text-destructive mt-1">{errors.portalEmail}</p>}
            </div>
            <div>
              <Label htmlFor="portalPassword">Password</Label>
              <Input
                id="portalPassword"
                type="password"
                value={formData.portalPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, portalPassword: e.target.value }))}
                placeholder="••••••••"
                className={errors.portalPassword ? 'border-destructive' : ''}
              />
              {errors.portalPassword && <p className="text-xs text-destructive mt-1">{errors.portalPassword}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Share these credentials securely with the client
              </p>
            </div>
          </div>
        )}
      </div>
    )}

    <Button onClick={onSubmit} disabled={isSaving} className="w-full">
      {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : submitLabel}
    </Button>
  </div>
);

export const ClientManagement = ({
  clients,
  isLoading,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  invoices,
}: ClientManagementProps) => {
  const [selectedClient, setSelectedClient] = useState<DbClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    if (!confirm(`Delete ${selectedClient.company_name}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    const result = await onDeleteClient(selectedClient.id);
    if (result.success) {
      setSelectedClient(null);
    }
    setIsDeleting(false);
  };

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      client.company_name.toLowerCase().includes(term) ||
      client.city.toLowerCase().includes(term) ||
      client.postcode.toLowerCase().includes(term)
    );
  });

  const clientInvoices = selectedClient
    ? invoices.filter(inv => inv.client_id === selectedClient.id)
    : [];

  const validate = (includePortal = false): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Required';
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.postcode.trim()) newErrors.postcode = 'Required';
    if (!formData.country.trim()) newErrors.country = 'Required';
    
    // Validate portal fields if creating portal user
    if (includePortal && formData.createPortalUser) {
      if (!formData.portalFullName.trim()) newErrors.portalFullName = 'Required';
      if (!formData.portalEmail.trim()) newErrors.portalEmail = 'Required';
      if (!formData.portalPassword.trim()) newErrors.portalPassword = 'Required';
      if (formData.portalPassword.length > 0 && formData.portalPassword.length < 6) {
        newErrors.portalPassword = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPortalUser = async (clientId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: formData.portalEmail,
          password: formData.portalPassword,
          fullName: formData.portalFullName,
          clientId,
        },
      });

      if (error) {
        const maybeBodyError = (error as any)?.context?.body?.error;
        throw new Error(maybeBodyError || error.message || 'Failed to create portal user');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create portal user');
      }

      toast.success('Client portal user created', {
        description: `Login: ${formData.portalEmail}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error creating portal user:', error);
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        toast.error('This email is already registered');
      } else {
        toast.error(error.message || 'Failed to create portal user');
      }
      return false;
    }
  };

  const handleAddClient = async () => {
    if (!validate(true)) return;
    setIsSaving(true);

    const result = await onAddClient({
      company_name: formData.company_name.trim(),
      address_line_1: formData.address_line_1.trim(),
      address_line_2: formData.address_line_2.trim() || null,
      city: formData.city.trim(),
      postcode: formData.postcode.trim(),
      country: formData.country.trim(),
    });

    if (result.success && result.data) {
      // Create portal user if requested
      if (formData.createPortalUser) {
        await createPortalUser(result.data.id);
      }
      
      setIsAddDialogOpen(false);
      setFormData(emptyFormData);
      setErrors({});
    }
    setIsSaving(false);
  };

  const handleEditClient = async () => {
    if (!selectedClient || !validate(false)) return;
    setIsSaving(true);

    const result = await onUpdateClient(selectedClient.id, {
      company_name: formData.company_name.trim(),
      address_line_1: formData.address_line_1.trim(),
      address_line_2: formData.address_line_2.trim() || null,
      city: formData.city.trim(),
      postcode: formData.postcode.trim(),
      country: formData.country.trim(),
    });

    if (result.success && result.data) {
      setSelectedClient(result.data);
      setIsEditDialogOpen(false);
    }
    setIsSaving(false);
  };

  const openEditDialog = () => {
    if (!selectedClient) return;
    setFormData({
      company_name: selectedClient.company_name,
      address_line_1: selectedClient.address_line_1,
      address_line_2: selectedClient.address_line_2 || '',
      city: selectedClient.city,
      postcode: selectedClient.postcode,
      country: selectedClient.country,
      createPortalUser: false,
      portalEmail: '',
      portalPassword: '',
      portalFullName: '',
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clients</h2>
          <p className="text-muted-foreground mt-1">Manage your clients and view their invoice history</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormData(emptyFormData); setErrors({}); }} size="lg" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm 
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              onSubmit={handleAddClient} 
              submitLabel="Add Client"
              isSaving={isSaving}
              showPortalFields={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Client List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {searchTerm ? 'No clients found' : 'No clients yet'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all duration-200',
                        selectedClient?.id === client.id
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-card border-border/50 hover:bg-muted/50 hover:border-border'
                      )}
                    >
                      <p className="font-medium text-sm text-foreground">{client.company_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {client.city}, {client.postcode}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Details & Audit */}
        <Card className="lg:col-span-2">
          {selectedClient ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{selectedClient.company_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={openEditDialog}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Client</DialogTitle>
                        </DialogHeader>
                        <ClientForm 
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          onSubmit={handleEditClient} 
                          submitLabel="Save Changes"
                          isSaving={isSaving}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDeleteClient}
                      disabled={isDeleting || clientInvoices.length > 0}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {clientInvoices.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cannot delete: client has {clientInvoices.length} invoice(s)
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Audit
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="text-sm">{selectedClient.address_line_1}</p>
                          {selectedClient.address_line_2 && (
                            <p className="text-sm">{selectedClient.address_line_2}</p>
                          )}
                          <p className="text-sm">{selectedClient.city}, {selectedClient.postcode}</p>
                          <p className="text-sm">{selectedClient.country}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="text-sm">{format(new Date(selectedClient.created_at), 'dd MMM yyyy')}</p>
                          <p className="text-xs text-muted-foreground mt-3">Last Updated</p>
                          <p className="text-sm">{format(new Date(selectedClient.updated_at), 'dd MMM yyyy HH:mm')}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">{clientInvoices.length}</p>
                            <p className="text-xs text-muted-foreground">Total Invoices</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">
                              {formatCurrency(clientInvoices.reduce((sum, inv) => sum + inv.grand_total, 0))}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Billed</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">
                              {clientInvoices.length > 0
                                ? format(new Date(clientInvoices[0].invoice_date), 'MMM yyyy')
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">Latest Invoice</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audit">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Invoice history for {selectedClient.company_name}
                      </div>

                      {clientInvoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No invoices found for this client</p>
                        </div>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Financial Period</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                  <TableCell className="font-mono text-sm">
                                    {invoice.invoice_number}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
                                  </TableCell>
                                  <TableCell>
                                    {invoice.financial_year} / W{invoice.financial_week}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(invoice.grand_total)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a client to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
