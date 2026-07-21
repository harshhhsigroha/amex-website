import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Copy, ExternalLink, Settings2, Eye, EyeOff, GripVertical, Plus, Trash2, 
  Type, FileUp, ListChecks, AlignLeft, PenLine, X, Loader2,
  Building2, Users
} from 'lucide-react';

type FieldType = 'text' | 'email' | 'tel' | 'date' | 'select' | 'short_answer' | 'long_answer' | 'mcq' | 'file_upload' | 'signature';

export type SectionType = 'personal' | 'bank' | 'documents' | 'agency' | 'p45' | 'eligibility' | 'control' | 'declaration' | 'custom';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
  section: SectionType;
  isCustom?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number;
}

const FIELD_TYPE_CONFIG = {
  short_answer: { icon: Type, label: 'Short Answer', description: 'Single line text input' },
  long_answer: { icon: AlignLeft, label: 'Long Answer', description: 'Multi-line text area' },
  mcq: { icon: ListChecks, label: 'Multiple Choice', description: 'Select from options' },
  file_upload: { icon: FileUp, label: 'File Upload', description: 'Upload documents or images' },
  signature: { icon: PenLine, label: 'Signature', description: 'Digital signature field' },
};

export const ALL_SECTIONS: SectionType[] = ['personal', 'bank', 'documents', 'agency', 'p45', 'eligibility', 'control', 'declaration', 'custom'];

export const DEFAULT_FIELDS: FormField[] = [
  // ── 1. Your Details ──
  { id: '1', name: 'title', label: 'Title', type: 'select', required: true, enabled: true, section: 'personal', options: ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Other'] },
  { id: '2', name: 'first_name', label: 'First Name', type: 'text', required: true, enabled: true, section: 'personal' },
  { id: '3', name: 'middle_name', label: 'Middle Name', type: 'text', required: false, enabled: true, section: 'personal', placeholder: 'Optional' },
  { id: '4', name: 'candidate_name', label: 'Surname', type: 'text', required: true, enabled: true, section: 'personal' },
  { id: '5', name: 'dob', label: 'Date of Birth', type: 'date', required: true, enabled: true, section: 'personal' },
  { id: '6', name: 'address', label: 'Address', type: 'long_answer', required: true, enabled: true, section: 'personal', placeholder: 'Address Line 1, Line 2, City, Postcode, Country' },
  { id: '7', name: 'contact_no', label: 'Telephone Number', type: 'tel', required: false, enabled: true, section: 'personal' },
  { id: '8', name: 'mobile_number', label: 'Mobile Number', type: 'tel', required: true, enabled: true, section: 'personal' },
  { id: '9', name: 'email', label: 'Email', type: 'email', required: true, enabled: true, section: 'personal' },
  { id: '10', name: 'nationality', label: 'Nationality', type: 'select', required: true, enabled: true, section: 'personal', options: ['British', 'Polish', 'Indian', 'Romanian', 'Irish', 'Italian', 'Portuguese', 'Spanish', 'French', 'Nigerian', 'Pakistani', 'Bangladeshi', 'Chinese', 'German', 'Lithuanian', 'Latvian', 'Bulgarian', 'Hungarian', 'Jamaican', 'Australian', 'South African', 'American', 'Other'] },
  { id: '11', name: 'right_to_work', label: 'Do you have the right to work in the UK?', type: 'mcq', required: true, enabled: true, section: 'personal', options: ['Yes', 'No'] },
  { id: '12', name: 'id_document_upload', label: 'Upload Identification', type: 'file_upload', required: true, enabled: true, section: 'personal', description: 'Upload passport, driving licence or other form of identification', acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 10 },
  { id: '13', name: 'portrait_upload', label: 'Portrait Upload', type: 'file_upload', required: true, enabled: true, section: 'personal', description: 'Please upload a passport-style photo of yourself', acceptedFileTypes: '.jpg,.jpeg,.png', maxFileSize: 5 },
  { id: '14', name: 'visa_required', label: 'Do you need a Visa to work?', type: 'mcq', required: false, enabled: true, section: 'personal', options: ['Yes', 'No'] },
  { id: '15', name: 'right_to_work_upload', label: 'Upload Proof of Right to Work', type: 'file_upload', required: false, enabled: true, section: 'personal', description: "Upload your Resident Permit or visit gov.uk/prove-right-to-work", acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 10 },
  { id: '16', name: 'ni_number', label: 'National Insurance Number', type: 'text', required: false, enabled: true, section: 'personal' },
  { id: '17', name: 'gender', label: 'Gender', type: 'mcq', required: true, enabled: true, section: 'personal', options: ['Male', 'Female', 'Other'] },

  // ── 2. Bank Details ──
  { id: '18', name: 'bank_name', label: 'Name of Bank or Building Society', type: 'text', required: true, enabled: true, section: 'bank' },
  { id: '19', name: 'beneficiary_name', label: 'Name of Account Holder', type: 'text', required: true, enabled: true, section: 'bank' },
  { id: '20', name: 'sort_code', label: 'Sort Code', type: 'text', required: true, enabled: true, section: 'bank' },
  { id: '21', name: 'account_number', label: 'Account Number', type: 'text', required: true, enabled: true, section: 'bank' },
  { id: '22', name: 'bank_reference', label: 'Reference Number', type: 'text', required: false, enabled: true, section: 'bank' },
  { id: '23', name: 'proof_of_banking_upload', label: 'Upload Proof of Banking', type: 'file_upload', required: true, enabled: true, section: 'bank', description: 'Screenshot of mobile banking, front of card, or bank statement showing sort code, account number and name', acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 10 },

  // ── 3. Documents / P45 ──
  { id: '24', name: 'p45_status', label: 'P45 Status', type: 'mcq', required: true, enabled: true, section: 'p45', options: ['I have enclosed form P45', 'I do not have a P45', 'Not able to enclose form P45'] },
  { id: '25', name: 'tax_statement', label: 'Tax Statement', type: 'mcq', required: true, enabled: true, section: 'p45', description: 'Read the following statements and select the ONE that applies to you', options: [
    'A - This is my first job since last 6 April (no Jobseeker\'s Allowance, ESA, or pension received)',
    'B - This is now my only job but I have had another since last 6 April',
    'C - I have another job or receive a State/Occupational Pension',
    'D - Student Loan applies'
  ] },

  // ── 4. Agency Details ──
  { id: '26', name: 'agency_name', label: 'Name of Agency', type: 'text', required: true, enabled: true, section: 'agency' },
  { id: '27', name: 'agency_contact', label: 'Agency Contact', type: 'text', required: false, enabled: true, section: 'agency' },
  { id: '28', name: 'agency_branch', label: 'Agency Branch', type: 'text', required: false, enabled: true, section: 'agency' },
  { id: '29', name: 'agency_telephone', label: 'Agency Telephone Number', type: 'tel', required: false, enabled: true, section: 'agency' },

  // ── 5. Eligibility Assessment ──
  { id: '30', name: 'ea_set_workplace', label: '1. Do you have a set workplace?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '31', name: 'ea_paid_from_home', label: '1a. If no set workplace, are you paid from the time when you set out from home?', type: 'mcq', required: false, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '32', name: 'ea_travel_worksites', label: '2. Are you required to travel to/between two or more worksite locations during your working day?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '33', name: 'ea_attend_depot', label: '3. Do you attend a depot each day prior to travelling to a workplace?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '34', name: 'ea_paid_travelling', label: '4. Are you paid for the time spent travelling between worksites?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '35', name: 'ea_duties_from_home', label: '5. Are part or all of your duties carried out from home?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '36', name: 'ea_travel_from_home', label: '6. If yes, does your role require you to travel to other workplaces from home?', type: 'mcq', required: false, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '37', name: 'ea_longer_than_24m', label: '7. Do you expect your current job to last longer than 24 months at this location?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '38', name: 'ea_further_jobs', label: '8. Do you intend to move on to further jobs after completing this one?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '39', name: 'ea_incur_costs', label: '9. Will you incur costs on travel and/or food during travel to your temporary workplace?', type: 'mcq', required: true, enabled: true, section: 'eligibility', options: ['Yes', 'No'] },
  { id: '40', name: 'ea_travel_method', label: '10. How will you travel to work?', type: 'text', required: false, enabled: true, section: 'eligibility' },
  { id: '41', name: 'ea_travel_time', label: '11. How long will the travel take each way?', type: 'text', required: false, enabled: true, section: 'eligibility' },

  // ── 6. Control Questionnaire ──
  { id: '42', name: 'cq_no_instructions', label: '1. Can you confirm you are not issued with specific detailed instructions on how to do your work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '43', name: 'cq_free_how', label: '2. Are you free to choose how you do your work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '44', name: 'cq_free_order', label: '3. Are you free to choose in what order you do your work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '45', name: 'cq_not_moved', label: '4. Can you confirm you cannot be moved to another job without your agreement?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '46', name: 'cq_solely_responsible', label: '5. Are you solely responsible for deciding how to do your work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '47', name: 'cq_not_supervised', label: '6. Can you confirm you are not supervised doing your work (beyond quality checks)?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '48', name: 'cq_free_when', label: '7. Are you free to choose when you want to work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '49', name: 'cq_qualified', label: '8. Are you qualified or skilled enough to never be subject to supervision or control?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },
  { id: '50', name: 'cq_no_other_control', label: '9. Can you confirm no other party has the right to supervise, direct or control how you work?', type: 'mcq', required: true, enabled: true, section: 'control', options: ['Yes', 'No'] },

  // ── 7. Worker Declaration ──
  { id: '51', name: 'declaration_name', label: 'Full Name', type: 'text', required: true, enabled: true, section: 'declaration', description: 'You agree that all information supplied is correct and true to the best of your knowledge.' },
  { id: '52', name: 'declaration_date', label: 'Date', type: 'date', required: true, enabled: true, section: 'declaration' },
  { id: '53', name: 'declaration_signature', label: 'Signature', type: 'signature', required: true, enabled: true, section: 'declaration', description: 'In the event of an incorrect or overpayment, you are required to return the excess amount within 48 hours of receiving written notification.' },
];

// Company onboarding default fields (simpler - business details)
const DEFAULT_COMPANY_FIELDS: FormField[] = [
  { id: 'c1', name: 'candidate_name', label: 'Contact Full Name', type: 'text', required: true, enabled: true, section: 'personal' },
  { id: 'c2', name: 'email', label: 'Business Email', type: 'email', required: true, enabled: true, section: 'personal' },
  { id: 'c3', name: 'contact_no', label: 'Phone Number', type: 'tel', required: false, enabled: true, section: 'personal' },
  { id: 'c4', name: 'address', label: 'Company Address', type: 'text', required: false, enabled: true, section: 'personal' },
  { id: 'c5', name: 'ni_number', label: 'Company Registration Number', type: 'text', required: false, enabled: true, section: 'personal' },
];

export const SECTIONS: Record<SectionType, { label: string; color: string }> = {
  personal: { label: 'Your Details', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  bank: { label: 'Bank Details', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  documents: { label: 'Documents', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  agency: { label: 'Agency Details', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  p45: { label: 'Form P45', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  eligibility: { label: 'Eligibility Assessment', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  control: { label: 'Control Questionnaire', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  declaration: { label: 'Worker Declaration', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  custom: { label: 'Custom Fields', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
};

// ── Single Form Builder ────────────────────────────────────────────────────────

interface FormBuilderProps {
  formType: string; // 'candidate' | 'company' | 'candidate_<clientId>'
  title: string;
  description: string;
  defaultFields: FormField[];
  onboardingUrl?: string;
  clientId?: string | null; // Required for client-specific forms so RLS allows saving
}

export function SingleFormBuilder({ formType, title, description, defaultFields, onboardingUrl, clientId }: FormBuilderProps) {
  const getEmptyNewField = (): Partial<FormField> => ({
    label: '',
    type: 'short_answer',
    required: false,
    options: [],
    description: '',
    acceptedFileTypes: '.pdf,.jpg,.png',
    maxFileSize: 5,
  });

  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [formName, setFormName] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const [newField, setNewField] = useState<Partial<FormField>>(getEmptyNewField);
  const [mcqOption, setMcqOption] = useState('');
  const [editOption, setEditOption] = useState('');

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_form_config')
        .select('*')
        .eq('form_type', formType)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfigId(data.id);
        setFormName(data.form_name);
        const savedFields = data.fields as unknown as FormField[];
        if (Array.isArray(savedFields) && savedFields.length > 0) {
          setFields(savedFields);
        }
      }
    } catch (err) {
      console.error('Failed to load form config:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formType]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      if (configId) {
        const { error } = await supabase
          .from('onboarding_form_config')
          .update({ form_name: formName, fields: JSON.parse(JSON.stringify(fields)) })
          .eq('id', configId);
        if (error) throw error;
      } else {
        const insertPayload: Record<string, unknown> = {
          form_name: formName,
          fields: JSON.parse(JSON.stringify(fields)),
          form_type: formType,
        };
        if (clientId) insertPayload.client_id = clientId;
        const { data, error } = await supabase
          .from('onboarding_form_config')
          .insert(insertPayload)
          .select('id')
          .single();
        if (error) throw error;
        setConfigId(data.id);
      }
      toast.success('Form configuration saved');
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration';
      toast.error('Save failed', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleField = (fieldId: string) => {
    setFields(current => current.map(field => field.id === fieldId ? { ...field, enabled: !field.enabled } : field));
  };

  const toggleRequired = (fieldId: string) => {
    setFields(current => current.map(field => field.id === fieldId ? { ...field, required: !field.required } : field));
  };

  const deleteField = (fieldId: string) => {
    setFields(current => current.filter(field => field.id !== fieldId));
  };

  const addMcqOption = () => {
    if (mcqOption.trim() && newField.options) {
      setNewField(current => ({ ...current, options: [...(current.options || []), mcqOption.trim()] }));
      setMcqOption('');
    }
  };

  const removeMcqOption = (index: number) => {
    setNewField(current => ({
      ...current,
      options: current.options?.filter((_, optionIndex) => optionIndex !== index) || [],
    }));
  };

  const closeEditFieldDialog = () => {
    setIsEditFieldOpen(false);
    setEditingField(null);
    setEditOption('');
  };

  const openFieldEditor = (field: FormField) => {
    setEditingField({
      ...field,
      options: field.options ? [...field.options] : undefined,
    });
    setEditOption('');
    setIsEditFieldOpen(true);
  };

  const updateEditingField = (updates: Partial<FormField>) => {
    setEditingField(current => current ? { ...current, ...updates } : current);
  };

  const addEditOption = () => {
    if (!editOption.trim() || !editingField) return;

    updateEditingField({
      options: [...(editingField.options || []), editOption.trim()],
    });
    setEditOption('');
  };

  const updateEditOption = (index: number, value: string) => {
    if (!editingField?.options) return;

    const nextOptions = [...editingField.options];
    nextOptions[index] = value;
    updateEditingField({ options: nextOptions });
  };

  const removeEditOption = (index: number) => {
    if (!editingField?.options) return;

    updateEditingField({
      options: editingField.options.filter((_, optionIndex) => optionIndex !== index),
    });
  };

  const saveEditedField = () => {
    if (!editingField) return;

    const sanitizedField: FormField = {
      ...editingField,
      label: editingField.label.trim(),
      description: editingField.description?.trim() || undefined,
      placeholder: editingField.placeholder?.trim() || undefined,
      acceptedFileTypes: editingField.acceptedFileTypes?.trim() || undefined,
      options: editingField.options?.map(option => option.trim()).filter(Boolean),
    };

    if (!sanitizedField.label) {
      toast.error('Please enter a question label');
      return;
    }

    if ((sanitizedField.type === 'mcq' || sanitizedField.type === 'select') && (sanitizedField.options?.length || 0) < 2) {
      toast.error('Please keep at least 2 options');
      return;
    }

    setFields(current => current.map(field => field.id === sanitizedField.id ? sanitizedField : field));
    toast.success('Question updated');
    closeEditFieldDialog();
  };

  const addCustomField = () => {
    if (!newField.label?.trim()) {
      toast.error('Please enter a field label');
      return;
    }

    if (newField.type === 'mcq' && (!newField.options || newField.options.length < 2)) {
      toast.error('Please add at least 2 options for multiple choice');
      return;
    }

    const field: FormField = {
      id: `custom_${Date.now()}`,
      name: `custom_${newField.label?.toLowerCase().replace(/\s+/g, '_')}`,
      label: newField.label!,
      type: newField.type as FieldType,
      required: newField.required || false,
      enabled: true,
      section: 'custom',
      isCustom: true,
      options: newField.options,
      description: newField.description,
      placeholder: newField.placeholder,
      acceptedFileTypes: newField.acceptedFileTypes,
      maxFileSize: newField.maxFileSize,
    };

    setFields(current => [...current, field]);
    setNewField(getEmptyNewField());
    setMcqOption('');
    setIsAddFieldOpen(false);
    toast.success('Custom field added');
  };

  const enabledCount = fields.filter(field => field.enabled).length;
  const requiredCount = fields.filter(field => field.required && field.enabled).length;
  const customCount = fields.filter(field => field.isCustom).length;

  const copyLink = () => {
    const url = `${window.location.origin}${onboardingUrl || '/onboarding'}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const getFieldTypeIcon = (type: FieldType) => {
    const config = FIELD_TYPE_CONFIG[type as keyof typeof FIELD_TYPE_CONFIG];
    if (config) {
      const Icon = config.icon;
      return <Icon className="h-3.5 w-3.5" />;
    }
    return <Type className="h-3.5 w-3.5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fieldsBySection = {
    personal: fields.filter(field => field.section === 'personal'),
    bank: fields.filter(field => field.section === 'bank'),
    documents: fields.filter(field => field.section === 'documents'),
    agency: fields.filter(field => field.section === 'agency'),
    p45: fields.filter(field => field.section === 'p45'),
    eligibility: fields.filter(field => field.section === 'eligibility'),
    control: fields.filter(field => field.section === 'control'),
    declaration: fields.filter(field => field.section === 'declaration'),
    custom: fields.filter(field => field.section === 'custom'),
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="text-xs">{enabledCount} fields enabled</Badge>
        <Badge variant="outline" className="text-xs">{requiredCount} required</Badge>
        {customCount > 0 && <Badge className="text-xs">{customCount} custom</Badge>}
        <div className="flex-1" />
        {onboardingUrl && (
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5" />Copy Link
          </Button>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Settings2 className="h-3.5 w-3.5" />Configure Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>Configure {title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 py-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input value={formName} onChange={event => setFormName(event.target.value)} placeholder={title} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Quick:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFields(current => current.map(field => ({ ...field, enabled: true })))}
                      className="h-7 text-xs"
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFields(current => current.map(field => ({ ...field, enabled: field.required })))}
                      className="h-7 text-xs"
                    >
                      Required Only
                    </Button>
                  </div>

                  <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Add Custom Field</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Custom Field</DialogTitle>
                        <DialogDescription>Create a new field for your onboarding form</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {(Object.entries(FIELD_TYPE_CONFIG) as [keyof typeof FIELD_TYPE_CONFIG, typeof FIELD_TYPE_CONFIG[keyof typeof FIELD_TYPE_CONFIG]][]).map(([type, config]) => {
                              const Icon = config.icon;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setNewField(current => ({ ...current, type: type as FieldType, options: type === 'mcq' ? current.options || [] : undefined }))}
                                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${newField.type === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                >
                                  <Icon className="h-4 w-4 text-primary" />
                                  <div>
                                    <div className="text-sm font-medium">{config.label}</div>
                                    <div className="text-xs text-muted-foreground">{config.description}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Question Label *</Label>
                          <Input value={newField.label || ''} onChange={event => setNewField(current => ({ ...current, label: event.target.value }))} placeholder="e.g., Emergency Contact" />
                        </div>
                        <div className="space-y-2">
                          <Label>Help Text (optional)</Label>
                          <Input value={newField.description || ''} onChange={event => setNewField(current => ({ ...current, description: event.target.value }))} placeholder="Help text shown below the field" />
                        </div>
                        {(newField.type === 'mcq' || newField.type === 'select') && (
                          <div className="space-y-2">
                            <Label>Options *</Label>
                            <div className="flex gap-2">
                              <Input value={mcqOption} onChange={event => setMcqOption(event.target.value)} placeholder="Add an option" onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addMcqOption())} />
                              <Button type="button" size="sm" onClick={addMcqOption}>Add</Button>
                            </div>
                            {newField.options && newField.options.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {newField.options.map((option, index) => (
                                  <Badge key={`${option}-${index}`} variant="secondary" className="gap-1 pr-1">
                                    {option}
                                    <button type="button" onClick={() => removeMcqOption(index)} className="rounded-full p-0.5 hover:bg-muted">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Switch id="required" checked={newField.required || false} onCheckedChange={checked => setNewField(current => ({ ...current, required: checked }))} />
                          <Label htmlFor="required" className="text-sm">Required field</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>Cancel</Button>
                        <Button onClick={addCustomField}>Add Field</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog
                  open={isEditFieldOpen}
                  onOpenChange={open => {
                    if (!open) closeEditFieldDialog();
                    else setIsEditFieldOpen(true);
                  }}
                >
                  <DialogContent className="max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Question</DialogTitle>
                      <DialogDescription>
                        Update the text candidates see for this field and adjust its settings.
                      </DialogDescription>
                    </DialogHeader>

                    {editingField && (
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                          <p>Section: <span className="font-medium text-foreground">{SECTIONS[editingField.section].label}</span></p>
                          <p className="mt-1">You can edit the visible question, help text, placeholder and options here.</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Label *</Label>
                          <Input
                            value={editingField.label}
                            onChange={event => updateEditingField({ label: event.target.value })}
                            placeholder="Question label"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Help Text</Label>
                          <Input
                            value={editingField.description || ''}
                            onChange={event => updateEditingField({ description: event.target.value })}
                            placeholder="Optional help text shown under the question"
                          />
                        </div>

                        {(editingField.type === 'text' || editingField.type === 'email' || editingField.type === 'tel' || editingField.type === 'date' || editingField.type === 'short_answer' || editingField.type === 'long_answer') && (
                          <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                              value={editingField.placeholder || ''}
                              onChange={event => updateEditingField({ placeholder: event.target.value })}
                              placeholder="Optional placeholder text"
                            />
                          </div>
                        )}

                        {(editingField.type === 'mcq' || editingField.type === 'select') && (
                          <div className="space-y-3">
                            <Label>Answer Options *</Label>
                            <div className="space-y-2">
                              {(editingField.options || []).map((option, index) => (
                                <div key={`${editingField.id}-option-${index}`} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={event => updateEditOption(index, event.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  <Button type="button" variant="outline" size="sm" onClick={() => removeEditOption(index)}>
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={editOption}
                                onChange={event => setEditOption(event.target.value)}
                                placeholder="Add another option"
                                onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addEditOption())}
                              />
                              <Button type="button" size="sm" onClick={addEditOption}>Add</Button>
                            </div>
                          </div>
                        )}

                        {editingField.type === 'file_upload' && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Accepted File Types</Label>
                              <Input
                                value={editingField.acceptedFileTypes || ''}
                                onChange={event => updateEditingField({ acceptedFileTypes: event.target.value })}
                                placeholder=".pdf,.jpg,.png"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max File Size (MB)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={editingField.maxFileSize ?? ''}
                                onChange={event => updateEditingField({ maxFileSize: event.target.value ? Number(event.target.value) : undefined })}
                                placeholder="5"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 p-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`edit-required-${editingField.id}`}
                              checked={editingField.required}
                              onCheckedChange={checked => updateEditingField({ required: checked })}
                            />
                            <Label htmlFor={`edit-required-${editingField.id}`}>Required</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`edit-enabled-${editingField.id}`}
                              checked={editingField.enabled}
                              onCheckedChange={checked => updateEditingField({ enabled: checked })}
                            />
                            <Label htmlFor={`edit-enabled-${editingField.id}`}>Visible on form</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={closeEditFieldDialog}>Cancel</Button>
                      <Button onClick={saveEditedField}>Save Question</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Accordion type="multiple" defaultValue={['personal', 'bank', 'documents', 'agency', 'p45', 'eligibility', 'control', 'declaration', 'custom']}>
                  {(Object.entries(fieldsBySection) as [keyof typeof SECTIONS, FormField[]][]).map(([section, sectionFields]) => (
                    sectionFields.length > 0 && (
                      <AccordionItem key={section} value={section}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${SECTIONS[section].color}`}>{SECTIONS[section].label}</Badge>
                            <span className="text-xs text-muted-foreground">{sectionFields.filter(field => field.enabled).length}/{sectionFields.length} enabled</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {sectionFields.map(field => (
                              <div key={field.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors sm:items-center ${field.enabled ? 'border-border bg-background' : 'border-border/40 bg-muted/30 opacity-60'}`}>
                                <div className="mt-0.5 shrink-0 text-muted-foreground sm:mt-0">{getFieldTypeIcon(field.type)}</div>
                                <button
                                  type="button"
                                  onClick={() => openFieldEditor(field)}
                                  className="flex-1 min-w-0 rounded-md text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium break-words">{field.label}</span>
                                    {field.required && field.enabled && <Badge className="h-4 px-1 text-[10px]" variant="destructive">required</Badge>}
                                    {field.isCustom && <Badge variant="outline" className="h-4 px-1 text-[10px]">custom</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{field.type.replace('_', ' ')}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">Click this question to edit its wording, help text and options.</p>
                                </button>
                                <div className="flex shrink-0 items-center gap-2">
                                  {field.enabled && (
                                    <button
                                      type="button"
                                      onClick={event => {
                                        event.stopPropagation();
                                        toggleRequired(field.id);
                                      }}
                                      className={`rounded border px-2 py-0.5 text-xs transition-colors whitespace-nowrap ${field.required ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                                    >
                                      {field.required ? 'Required' : 'Optional'}
                                    </button>
                                  )}
                                  <Switch checked={field.enabled} onCheckedChange={() => toggleField(field.id)} />
                                  {field.isCustom && (
                                    <button
                                      type="button"
                                      onClick={event => {
                                        event.stopPropagation();
                                        deleteField(field.id);
                                      }}
                                      className="p-1 text-destructive transition-colors hover:text-destructive/80"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  ))}
                </Accordion>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fields.filter(field => field.enabled).slice(0, 6).map(field => (
          <div key={field.id} className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 p-2 text-xs">
            {getFieldTypeIcon(field.type)}
            <span className="truncate">{field.label}</span>
            {field.required && <span className="ml-auto text-destructive">*</span>}
          </div>
        ))}
        {fields.filter(field => field.enabled).length > 6 && (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground">
            +{fields.filter(field => field.enabled).length - 6} more
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function OnboardingFormBuilder() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Onboarding Forms
          </CardTitle>
          <CardDescription>
            Configure separate registration forms for companies and end users
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="candidate">
          <TabsList className="mb-4">
            <TabsTrigger value="candidate" className="gap-2">
              <Users className="h-3.5 w-3.5" />End User (Candidate)
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-3.5 w-3.5" />Company Onboarding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidate">
            <div className="mb-3 p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-xs text-muted-foreground">
                This form is used when <strong>end users / workers</strong> register on the platform. Accessible at <code className="font-mono text-xs bg-background px-1 rounded">/onboarding</code>.
              </p>
            </div>
            <SingleFormBuilder
              formType="candidate"
              title="Candidate Registration"
              description="Configure the form workers fill in when registering on the platform."
              defaultFields={DEFAULT_FIELDS}
              onboardingUrl="/onboarding"
            />
          </TabsContent>

          <TabsContent value="company">
            <div className="mb-3 p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-xs text-muted-foreground">
                This form is used when <strong>companies / clients</strong> onboard onto your platform. Accessible at <code className="font-mono text-xs bg-background px-1 rounded">/onboarding/company</code>.
              </p>
            </div>
            <SingleFormBuilder
              formType="company"
              title="Company Registration"
              description="Configure the form companies fill in when onboarding onto your platform."
              defaultFields={DEFAULT_COMPANY_FIELDS}
              onboardingUrl="/onboarding/company"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
