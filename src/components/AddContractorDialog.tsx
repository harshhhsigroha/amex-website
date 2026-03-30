import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Candidate } from '@/types/candidate';
import { toast } from 'sonner';

interface AddContractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empId: string;
  candidateName?: string;
  onSave: (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function AddContractorDialog({
  open,
  onOpenChange,
  empId,
  candidateName,
  onSave,
}: AddContractorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    candidate_name: candidateName || '',
    address: '',
    beneficiary_name: '',
    account_number: '',
    sort_code: '',
    bank_name: '',
    ni_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.candidate_name.trim()) {
      toast.error('Candidate name is required');
      return;
    }
    if (!formData.beneficiary_name.trim()) {
      toast.error('Beneficiary name is required');
      return;
    }
    if (!formData.account_number.trim()) {
      toast.error('Account number is required');
      return;
    }
    if (!formData.sort_code.trim()) {
      toast.error('Sort code is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        emp_id: empId,
        candidate_name: formData.candidate_name.trim(),
        client_id: null,
        address: formData.address.trim() || null,
        agency: null,
        beneficiary_name: formData.beneficiary_name.trim(),
        account_number: formData.account_number.trim(),
        sort_code: formData.sort_code.trim(),
        bank_name: formData.bank_name.trim() || null,
        ni_number: formData.ni_number.trim() || null,
        gender: null,
        dob: null,
        contact_no: null,
        email: null,
        internal_name: null,
        has_candidate_id: false,
        application: false,
        proof_of_address: false,
        right_to_work: false,
        hourly_rate: null,
      });
      toast.success('Contractor details saved');
      onOpenChange(false);
      // Reset form
      setFormData({
        candidate_name: '',
        address: '',
        beneficiary_name: '',
        account_number: '',
        sort_code: '',
        bank_name: '',
        ni_number: '',
      });
    } catch (error) {
      toast.error('Failed to save contractor details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contractor Details</DialogTitle>
          <DialogDescription>
            Add payment details for EMP ID: {empId}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate_name">Full Name *</Label>
            <Input
              id="candidate_name"
              value={formData.candidate_name}
              onChange={(e) => setFormData(prev => ({ ...prev, candidate_name: e.target.value }))}
              placeholder="John Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, City, Postcode"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Payment Details</p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="beneficiary_name">Beneficiary Name *</Label>
                <Input
                  id="beneficiary_name"
                  value={formData.beneficiary_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_name: e.target.value }))}
                  placeholder="Account holder name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sort_code">Sort Code *</Label>
                  <Input
                    id="sort_code"
                    value={formData.sort_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_code: e.target.value }))}
                    placeholder="00-00-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    placeholder="12345678"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="Bank name (optional)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ni_number">NI Number</Label>
            <Input
              id="ni_number"
              value={formData.ni_number}
              onChange={(e) => setFormData(prev => ({ ...prev, ni_number: e.target.value }))}
              placeholder="AB123456C (optional)"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
