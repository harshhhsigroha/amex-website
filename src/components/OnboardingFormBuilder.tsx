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

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
  section: 'personal' | 'bank' | 'documents' | 'custom';
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

export const DEFAULT_FIELDS: FormField[] = [
  { id: '1', name: 'candidate_name', label: 'Full Name', type: 'text', required: true, enabled: true, section: 'personal' },
  { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, enabled: true, section: 'personal' },
  { id: '3', name: 'contact_no', label: 'Phone Number', type: 'tel', required: false, enabled: true, section: 'personal' },
  { id: '4', name: 'address', label: 'Address', type: 'text', required: false, enabled: true, section: 'personal' },
  { id: '5', name: 'dob', label: 'Date of Birth', type: 'date', required: false, enabled: true, section: 'personal' },
  { id: '6', name: 'gender', label: 'Gender', type: 'select', required: false, enabled: true, section: 'personal' },
  { id: '7', name: 'ni_number', label: 'National Insurance Number', type: 'text', required: false, enabled: true, section: 'personal' },
  { id: '8', name: 'bank_name', label: 'Bank Name', type: 'text', required: false, enabled: true, section: 'bank' },
  { id: '9', name: 'sort_code', label: 'Sort Code', type: 'text', required: false, enabled: true, section: 'bank' },
  { id: '10', name: 'account_number', label: 'Account Number', type: 'text', required: false, enabled: true, section: 'bank' },
  { id: '11', name: 'beneficiary_name', label: 'Account Holder Name', type: 'text', required: false, enabled: true, section: 'bank' },
  { id: '12', name: 'has_candidate_id', label: 'ID Document', type: 'select', required: false, enabled: true, section: 'documents' },
  { id: '13', name: 'right_to_work', label: 'Right to Work', type: 'select', required: false, enabled: true, section: 'documents' },
  { id: '14', name: 'proof_of_address', label: 'Proof of Address', type: 'select', required: false, enabled: true, section: 'documents' },
  { id: '15', name: 'id_document_upload', label: 'Upload ID Document', type: 'file_upload', required: false, enabled: true, section: 'documents', isCustom: false, description: 'Upload a copy of your passport, driving licence, or national ID card', acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 5 },
  { id: '16', name: 'right_to_work_upload', label: 'Upload Right to Work', type: 'file_upload', required: false, enabled: true, section: 'documents', isCustom: false, description: 'Upload your right to work document (visa, share code, etc.)', acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 5 },
  { id: '17', name: 'proof_of_address_upload', label: 'Upload Proof of Address', type: 'file_upload', required: false, enabled: true, section: 'documents', isCustom: false, description: 'Upload a recent utility bill or bank statement (within 3 months)', acceptedFileTypes: '.pdf,.jpg,.jpeg,.png', maxFileSize: 5 },
];

// Company onboarding default fields (simpler — business details)
const DEFAULT_COMPANY_FIELDS: FormField[] = [
  { id: 'c1', name: 'candidate_name', label: 'Contact Full Name', type: 'text', required: true, enabled: true, section: 'personal' },
  { id: 'c2', name: 'email', label: 'Business Email', type: 'email', required: true, enabled: true, section: 'personal' },
  { id: 'c3', name: 'contact_no', label: 'Phone Number', type: 'tel', required: false, enabled: true, section: 'personal' },
  { id: 'c4', name: 'address', label: 'Company Address', type: 'text', required: false, enabled: true, section: 'personal' },
  { id: 'c5', name: 'ni_number', label: 'Company Registration Number', type: 'text', required: false, enabled: true, section: 'personal' },
];

const SECTIONS = {
  personal: { label: 'Personal Information', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  bank: { label: 'Bank Details', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  documents: { label: 'Documents', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
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
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [formName, setFormName] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);

  const [newField, setNewField] = useState<Partial<FormField>>({
    label: '',
    type: 'short_answer',
    required: false,
    options: [],
    description: '',
    acceptedFileTypes: '.pdf,.jpg,.png',
    maxFileSize: 5,
  });
  const [mcqOption, setMcqOption] = useState('');

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
        // Include client_id so RLS policy allows clients to save their own config
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

  const toggleField = (fieldId: string) => setFields(fields.map(f => f.id === fieldId ? { ...f, enabled: !f.enabled } : f));
  const toggleRequired = (fieldId: string) => setFields(fields.map(f => f.id === fieldId ? { ...f, required: !f.required } : f));
  const deleteField = (fieldId: string) => setFields(fields.filter(f => f.id !== fieldId));
  const addMcqOption = () => {
    if (mcqOption.trim() && newField.options) {
      setNewField({ ...newField, options: [...newField.options, mcqOption.trim()] });
      setMcqOption('');
    }
  };
  const removeMcqOption = (index: number) => {
    if (newField.options) setNewField({ ...newField, options: newField.options.filter((_, i) => i !== index) });
  };

  const addCustomField = () => {
    if (!newField.label?.trim()) { toast.error('Please enter a field label'); return; }
    if (newField.type === 'mcq' && (!newField.options || newField.options.length < 2)) {
      toast.error('Please add at least 2 options for multiple choice'); return;
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
    setFields([...fields, field]);
    setNewField({ label: '', type: 'short_answer', required: false, options: [], description: '', acceptedFileTypes: '.pdf,.jpg,.png', maxFileSize: 5 });
    setIsAddFieldOpen(false);
    toast.success('Custom field added');
  };

  const enabledCount = fields.filter(f => f.enabled).length;
  const requiredCount = fields.filter(f => f.required && f.enabled).length;
  const customCount = fields.filter(f => f.isCustom).length;

  const copyLink = () => {
    const url = `${window.location.origin}${onboardingUrl || '/onboarding'}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const getFieldTypeIcon = (type: FieldType) => {
    const config = FIELD_TYPE_CONFIG[type as keyof typeof FIELD_TYPE_CONFIG];
    if (config) { const Icon = config.icon; return <Icon className="h-3.5 w-3.5" />; }
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
    personal: fields.filter(f => f.section === 'personal'),
    bank: fields.filter(f => f.section === 'bank'),
    documents: fields.filter(f => f.section === 'documents'),
    custom: fields.filter(f => f.section === 'custom'),
  };

  return (
    <div className="space-y-4">
      {/* Header stats */}
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure {title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={title} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Quick:</span>
                  <Button variant="ghost" size="sm" onClick={() => setFields(fields.map(f => ({ ...f, enabled: true })))} className="h-7 text-xs">Enable All</Button>
                  <Button variant="ghost" size="sm" onClick={() => setFields(fields.map(f => ({ ...f, enabled: f.required })))} className="h-7 text-xs">Required Only</Button>
                </div>
                <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Add Custom Field</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Custom Field</DialogTitle>
                      <DialogDescription>Create a new field for your onboarding form</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.entries(FIELD_TYPE_CONFIG) as [keyof typeof FIELD_TYPE_CONFIG, typeof FIELD_TYPE_CONFIG[keyof typeof FIELD_TYPE_CONFIG]][]).map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                              <div key={type} onClick={() => setNewField({ ...newField, type: type as FieldType, options: type === 'mcq' ? [] : undefined })}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${newField.type === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                <Icon className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="text-sm font-medium">{config.label}</div>
                                  <div className="text-xs text-muted-foreground">{config.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Field Label *</Label>
                        <Input value={newField.label || ''} onChange={e => setNewField({ ...newField, label: e.target.value })} placeholder="e.g., Emergency Contact" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Input value={newField.description || ''} onChange={e => setNewField({ ...newField, description: e.target.value })} placeholder="Help text shown below the field" />
                      </div>
                      {newField.type === 'mcq' && (
                        <div className="space-y-2">
                          <Label>Options *</Label>
                          <div className="flex gap-2">
                            <Input value={mcqOption} onChange={e => setMcqOption(e.target.value)} placeholder="Add an option" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMcqOption())} />
                            <Button type="button" size="sm" onClick={addMcqOption}>Add</Button>
                          </div>
                          {newField.options && newField.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {newField.options.map((opt, i) => (
                                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                                  {opt}
                                  <button onClick={() => removeMcqOption(i)} className="ml-1 hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch id="required" checked={newField.required || false} onCheckedChange={v => setNewField({ ...newField, required: v })} />
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

              {/* Fields by section */}
              <Accordion type="multiple" defaultValue={['personal', 'bank', 'documents', 'custom']}>
                {(Object.entries(fieldsBySection) as [keyof typeof SECTIONS, FormField[]][]).map(([section, sectionFields]) => (
                  sectionFields.length > 0 && (
                    <AccordionItem key={section} value={section}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${SECTIONS[section].color}`}>{SECTIONS[section].label}</Badge>
                          <span className="text-xs text-muted-foreground">{sectionFields.filter(f => f.enabled).length}/{sectionFields.length} enabled</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {sectionFields.map(field => (
                            <div key={field.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${field.enabled ? 'border-border bg-background' : 'border-border/40 bg-muted/30 opacity-60'}`}>
                              <div className="text-muted-foreground">{getFieldTypeIcon(field.type)}</div>
                              <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{field.label}</span>
                                  {field.required && field.enabled && <Badge className="text-[10px] h-4 px-1" variant="destructive">required</Badge>}
                                  {field.isCustom && <Badge variant="outline" className="text-[10px] h-4 px-1">custom</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{field.type.replace('_', ' ')}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {field.enabled && (
                                  <button onClick={() => toggleRequired(field.id)} className={`text-xs px-2 py-0.5 rounded border transition-colors ${field.required ? 'bg-red-500/10 text-red-600 border-red-200' : 'text-muted-foreground border-border hover:border-primary/50'}`}>
                                    {field.required ? 'Required' : 'Optional'}
                                  </button>
                                )}
                                <Switch checked={field.enabled} onCheckedChange={() => toggleField(field.id)} />
                                {field.isCustom && (
                                  <button onClick={() => deleteField(field.id)} className="text-destructive hover:text-destructive/80 p-1">
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview of enabled fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {fields.filter(f => f.enabled).slice(0, 6).map(f => (
          <div key={f.id} className="flex items-center gap-1.5 p-2 rounded-md border border-border/50 bg-muted/20 text-xs">
            {getFieldTypeIcon(f.type)}
            <span className="truncate">{f.label}</span>
            {f.required && <span className="text-destructive ml-auto">*</span>}
          </div>
        ))}
        {fields.filter(f => f.enabled).length > 6 && (
          <div className="flex items-center justify-center p-2 rounded-md border border-dashed border-border text-xs text-muted-foreground">
            +{fields.filter(f => f.enabled).length - 6} more
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
