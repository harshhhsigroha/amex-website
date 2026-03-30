import { useState, useCallback } from 'react';
import { Candidate, REQUIRED_PAYMENT_FIELDS } from '@/types/candidate';
import { validateCandidatePaymentDetails } from '@/lib/candidateMasterParser';
import { useSubClients } from '@/hooks/useSubClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Edit2, 
  CheckCircle, 
  AlertTriangle,
  Save,
  X,
  Loader2,
  Trash2,
  Plus,
  Eye,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { CandidateDetailDialog } from './CandidateDetailDialog';

interface CandidateListProps {
  candidates: Candidate[];
  isLoading: boolean;
  onUpdateCandidate: (id: string, updates: Partial<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  onAddCandidate: (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export function CandidateList({ candidates, isLoading, onUpdateCandidate, onAddCandidate, onClearAll }: CandidateListProps) {
  const { subClients } = useSubClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState<Partial<Candidate>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmPaymentEdit, setConfirmPaymentEdit] = useState(false);
  const [pendingPaymentChanges, setPendingPaymentChanges] = useState<Partial<Candidate>>({});
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Candidate>>({});
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = candidates.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.candidate_name.toLowerCase().includes(search) ||
      c.emp_id.toLowerCase().includes(search) ||
      (c.account_number && c.account_number.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search))
    );
  });

  const handleEdit = useCallback((candidate: Candidate) => {
    setEditingCandidate(candidate);
    setEditForm({
      candidate_name: candidate.candidate_name,
      address: candidate.address || '',
      agency: candidate.agency || '',
      beneficiary_name: candidate.beneficiary_name || '',
      account_number: candidate.account_number || '',
      sort_code: candidate.sort_code || '',
      bank_name: candidate.bank_name || '',
      ni_number: candidate.ni_number || '',
      gender: candidate.gender || '',
      dob: candidate.dob || '',
      contact_no: candidate.contact_no || '',
      email: candidate.email || '',
      hourly_rate: candidate.hourly_rate ?? undefined,
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingCandidate) return;

    // Check if payment fields are being changed
    const paymentFieldsChanged = 
      editForm.beneficiary_name !== (editingCandidate.beneficiary_name || '') ||
      editForm.account_number !== (editingCandidate.account_number || '') ||
      editForm.sort_code !== (editingCandidate.sort_code || '');

    if (paymentFieldsChanged && !confirmPaymentEdit) {
      setPendingPaymentChanges(editForm);
      setConfirmPaymentEdit(true);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateCandidate(editingCandidate.id, editForm);
      setEditingCandidate(null);
      setConfirmPaymentEdit(false);
      setPendingPaymentChanges({});
    } catch {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  }, [editingCandidate, editForm, confirmPaymentEdit, onUpdateCandidate]);

  const handleConfirmPaymentEdit = useCallback(async () => {
    if (!editingCandidate) return;
    
    setIsSaving(true);
    try {
      await onUpdateCandidate(editingCandidate.id, pendingPaymentChanges);
      setEditingCandidate(null);
      setConfirmPaymentEdit(false);
      setPendingPaymentChanges({});
      toast.success('Payment details updated', {
        description: 'Changes will only affect future invoices',
      });
    } catch {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  }, [editingCandidate, pendingPaymentChanges, onUpdateCandidate]);

  const getPaymentStatus = (candidate: Candidate) => {
    const validation = validateCandidatePaymentDetails(candidate);
    return validation;
  };

  const handleClearAll = useCallback(async () => {
    setIsClearing(true);
    try {
      await onClearAll();
      setConfirmClearAll(false);
    } catch {
      // Error handled in hook
    } finally {
      setIsClearing(false);
    }
  }, [onClearAll]);

  const handleAddCandidate = useCallback(async () => {
    if (!addForm.candidate_name) {
      toast.error('Candidate name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Generate emp_id from name
      const empId = addForm.candidate_name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) + 
        String(Date.now()).slice(-3);
      
      await onAddCandidate({
        emp_id: empId,
        candidate_name: addForm.candidate_name,
        client_id: null,
        address: addForm.address || null,
        agency: addForm.agency || null,
        beneficiary_name: addForm.beneficiary_name || null,
        account_number: addForm.account_number || null,
        sort_code: addForm.sort_code || null,
        bank_name: addForm.bank_name || null,
        ni_number: addForm.ni_number || null,
        gender: addForm.gender || null,
        dob: addForm.dob || null,
        contact_no: addForm.contact_no || null,
        email: addForm.email || null,
        internal_name: addForm.internal_name || null,
        has_candidate_id: null,
        application: null,
        proof_of_address: null,
        right_to_work: null,
        hourly_rate: addForm.hourly_rate ?? null,
      });
      setShowAddDialog(false);
      setAddForm({});
    } catch {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  }, [addForm, onAddCandidate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Candidate Master List
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{candidates.length} candidates</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAddForm({});
                setShowAddDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Candidate
            </Button>
            {candidates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClearAll(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, account, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Candidate Name</TableHead>
                <TableHead className="w-[100px]">EMP ID</TableHead>
                <TableHead className="w-[150px]">Umbrella / Recipient</TableHead>
                <TableHead className="w-[120px]">Account No</TableHead>
                <TableHead className="w-[100px]">Sort Code</TableHead>
                <TableHead className="w-[100px]">Payment</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'No candidates match your search' : 'No candidates loaded'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => {
                  const paymentStatus = getPaymentStatus(candidate);
                  return (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.candidate_name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {candidate.emp_id}
                      </TableCell>
                      <TableCell>
                        {candidate.agency ? (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Building2 className="h-2.5 w-2.5" />
                            {candidate.agency}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {candidate.account_number || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {candidate.sort_code || '-'}
                      </TableCell>
                      <TableCell>
                        {paymentStatus.valid ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingCandidate(candidate)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(candidate)}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Payment ready
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            Missing payment details
          </span>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update candidate details. Changes to payment fields only affect future invoices.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidate_name">Candidate Name *</Label>
                <Input
                  id="candidate_name"
                  value={editForm.candidate_name || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, candidate_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Payment Details (Required for Invoice Generation)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiary_name">Beneficiary Name *</Label>
                  <Input
                    id="beneficiary_name"
                    value={editForm.beneficiary_name || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, beneficiary_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={editForm.account_number || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, account_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_code">Sort Code *</Label>
                  <Input
                    id="sort_code"
                    value={editForm.sort_code || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, sort_code: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={editForm.bank_name || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, bank_name: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Rate & Optional Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.hourly_rate ?? ''}
                    onChange={(e) => setEditForm(f => ({ ...f, hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    placeholder="e.g. 12.50"
                  />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Optional Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency / Invoice Recipient</Label>
                  <Select value={editForm.agency || '__none__'} onValueChange={v => setEditForm(f => ({ ...f, agency: v === '__none__' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select agency..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {subClients.map(sc => (
                        <SelectItem key={sc.id} value={sc.company_name}>{sc.company_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ni_number">NI Number</Label>
                  <Input
                    id="ni_number"
                    value={editForm.ni_number || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, ni_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_no">Contact No</Label>
                  <Input
                    id="contact_no"
                    value={editForm.contact_no || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, contact_no: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={editForm.gender || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, gender: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    value={editForm.dob || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, dob: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCandidate(null)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Edit Confirmation Dialog */}
      <Dialog open={confirmPaymentEdit} onOpenChange={setConfirmPaymentEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Payment Details Change
            </DialogTitle>
            <DialogDescription>
              You are about to modify payment details (Beneficiary Name, Account Number, or Sort Code).
              <br /><br />
              <strong>Important:</strong> This change will only affect future invoices. Previously generated invoices remain immutable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmPaymentEdit(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmPaymentEdit}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Clear All Candidates
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {candidates.length} candidates from the master list?
              <br /><br />
              <strong>Important:</strong> This action cannot be undone. Previously generated invoices will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmClearAll(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Enter candidate details. Only Candidate Name is required to create a record.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add_candidate_name">Candidate Name *</Label>
                <Input
                  id="add_candidate_name"
                  value={addForm.candidate_name || ''}
                  onChange={(e) => setAddForm(f => ({ ...f, candidate_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_address">Address</Label>
                <Input
                  id="add_address"
                  value={addForm.address || ''}
                  onChange={(e) => setAddForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3 text-primary">
                Payment Details (Required for Invoice Generation)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_beneficiary_name">Beneficiary Name</Label>
                  <Input
                    id="add_beneficiary_name"
                    value={addForm.beneficiary_name || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, beneficiary_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_account_number">Account Number</Label>
                  <Input
                    id="add_account_number"
                    value={addForm.account_number || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, account_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_sort_code">Sort Code</Label>
                  <Input
                    id="add_sort_code"
                    value={addForm.sort_code || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, sort_code: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_bank_name">Bank Name</Label>
                  <Input
                    id="add_bank_name"
                    value={addForm.bank_name || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, bank_name: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Optional Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_agency">Agency / Invoice Recipient</Label>
                  <Select value={addForm.agency || '__none__'} onValueChange={v => setAddForm(f => ({ ...f, agency: v === '__none__' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select agency..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {subClients.map(sc => (
                        <SelectItem key={sc.id} value={sc.company_name}>{sc.company_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_ni_number">NI Number</Label>
                  <Input
                    id="add_ni_number"
                    value={addForm.ni_number || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, ni_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_email">Email</Label>
                  <Input
                    id="add_email"
                    type="email"
                    value={addForm.email || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_contact_no">Contact No</Label>
                  <Input
                    id="add_contact_no"
                    value={addForm.contact_no || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, contact_no: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_gender">Gender</Label>
                  <Input
                    id="add_gender"
                    value={addForm.gender || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, gender: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_dob">Date of Birth</Label>
                  <Input
                    id="add_dob"
                    value={addForm.dob || ''}
                    onChange={(e) => setAddForm(f => ({ ...f, dob: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddCandidate} disabled={isSaving || !addForm.candidate_name}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CandidateDetailDialog
        candidate={viewingCandidate}
        open={!!viewingCandidate}
        onOpenChange={(open) => !open && setViewingCandidate(null)}
      />
    </Card>
  );
}
