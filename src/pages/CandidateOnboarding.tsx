import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, User, CreditCard, FileCheck, Building2 } from 'lucide-react';
import { FormField, DEFAULT_FIELDS, ALL_SECTIONS, SECTIONS } from '@/components/OnboardingFormBuilder';
import { SignaturePad } from '@/components/onboarding/SignaturePad';
import { OnboardingFileUpload } from '@/components/onboarding/OnboardingFileUpload';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';
import { useCustomDomainContext } from '@/contexts/CustomDomainContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Map field names to DB columns for known fields
const FIELD_TO_DB_MAP: Record<string, string> = {
  candidate_name: 'candidate_name',
  email: 'email',
  contact_no: 'contact_no',
  address: 'address',
  dob: 'dob',
  gender: 'gender',
  ni_number: 'ni_number',
  bank_name: 'bank_name',
  sort_code: 'sort_code',
  account_number: 'account_number',
  beneficiary_name: 'beneficiary_name',
  has_candidate_id: 'has_candidate_id',
  right_to_work: 'right_to_work',
  proof_of_address: 'proof_of_address',
};

export default function CandidateOnboarding() {
  const navigate = useNavigate();
  const { clientId: paramClientId } = useParams<{ clientId?: string }>();
  const { domainInfo } = useCustomDomainContext();
  // Use clientId from URL params, or fall back to custom domain's clientId
  const clientId = paramClientId || domainInfo?.clientId || undefined;
  const { whiteLabel } = useWhiteLabel(clientId ?? null);

  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formName, setFormName] = useState('Candidate Registration');
  const [enabledFields, setEnabledFields] = useState<FormField[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const formLoadedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);

  const brandName = whiteLabel?.brand_name || 'AMEX Outsourcing';
  const logoUrl = whiteLabel?.logo_url || null;

  // Group enabled fields by section for step navigation
  const activeSections = ALL_SECTIONS.filter(s => enabledFields.some(f => f.section === s));
  const totalSteps = activeSections.length + 1; // +1 for review

  // Load form config — prefer client-specific form if clientId is in the URL
  const loadConfig = useCallback(async () => {
    try {
      let data = null;

      // Try client-specific form first (via URL param)
      if (clientId) {
        const res = await supabase
          .from('onboarding_form_config')
          .select('*')
          .eq('form_type', `candidate_${clientId}`)
          .maybeSingle();
        data = res.data;
      }

      // Fall back to global form
      if (!data) {
        const res = await supabase
          .from('onboarding_form_config')
          .select('*')
          .eq('form_type', 'candidate')
          .limit(1)
          .maybeSingle();
        data = res.data;
      }

      let fields: FormField[];
      if (data) {
        setFormName(data.form_name);
        fields = (data.fields as unknown as FormField[]) || DEFAULT_FIELDS;
      } else {
        fields = DEFAULT_FIELDS;
      }

      const enabled = fields.filter(f => f.enabled);
      setEnabledFields(enabled);

      // Initialize form values
      const initialValues: Record<string, string | boolean> = {};
      enabled.forEach(f => {
        if (f.section === 'documents' && !f.isCustom) {
          initialValues[f.name] = false;
        } else {
          initialValues[f.name] = '';
        }
      });
      setFormValues(initialValues);
    } catch (err) {
      console.error('Failed to load form config:', err);
      // Fallback to defaults
      const enabled = DEFAULT_FIELDS.filter(f => f.enabled);
      setEnabledFields(enabled);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]); // clientId in deps so each agency loads their own form

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateValue = (name: string, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const getCurrentSectionFields = () => {
    if (currentStep > activeSections.length) return []; // review step
    const section = activeSections[currentStep - 1];
    return enabledFields.filter(f => f.section === section);
  };

  const validateStep = (): boolean => {
    if (currentStep > activeSections.length) return true; // review
    const sectionFields = getCurrentSectionFields();
    const missing = sectionFields.filter(f => {
      if (!f.required) return false;
      const val = formValues[f.name];
      if (typeof val === 'boolean') return false; // checkboxes are always valid
      return !val || (typeof val === 'string' && !val.trim());
    });

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return false;
    }

    // Email validation
    const emailField = sectionFields.find(f => f.type === 'email');
    if (emailField) {
      const emailVal = formValues[emailField.name];
      if (emailVal && typeof emailVal === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateEmpId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PC-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!gdprConsent) {
      toast.error('Please confirm your consent to data processing before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Construct full name from split fields
      const firstName = ((formValues['first_name'] as string) || '').trim();
      const middleName = ((formValues['middle_name'] as string) || '').trim();
      const surname = ((formValues['candidate_name'] as string) || '').trim();
      const candidateName = [firstName, middleName, surname].filter(Boolean).join(' ');

      if (!candidateName) {
        toast.error('Name is required');
        setIsSubmitting(false);
        return;
      }

      // Build submission payload
      const payload: Record<string, unknown> = {
        candidate_name: candidateName,
        _form_loaded_at: String(formLoadedAt.current),
        _hp_field: honeypot, // honeypot field
      };

      // Map enabled fields to DB columns
      enabledFields.forEach(f => {
        const dbCol = FIELD_TO_DB_MAP[f.name];
        if (dbCol && dbCol !== 'candidate_name') {
          const val = formValues[f.name];
          if (typeof val === 'boolean') {
            payload[dbCol] = val;
          } else if (typeof val === 'string' && val.trim()) {
            payload[dbCol] = val.trim();
          }
        }
      });

      // Submit via secure edge function
      const { data, error } = await supabase.functions.invoke('submit-onboarding', {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIsSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit registration';
      toast.error('Submission failed', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Registration Complete!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for registering. Our team will review your information and be in touch soon.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const sectionIcons: Record<string, React.ElementType> = {
    personal: User,
    bank: CreditCard,
    documents: FileCheck,
    agency: Building2,
    p45: FileCheck,
    eligibility: FileCheck,
    control: FileCheck,
    declaration: FileCheck,
    custom: Building2,
  };

  const sectionLabels: Record<string, string> = Object.fromEntries(
    Object.entries(SECTIONS).map(([k, v]) => [k, v.label])
  );

  const steps = [
    ...activeSections.map(s => ({
      title: sectionLabels[s],
      icon: sectionIcons[s],
    })),
    { title: 'Review', icon: CheckCircle2 },
  ];

  const isReviewStep = currentStep > activeSections.length;

  const renderField = (field: FormField) => {
    const value = formValues[field.name];

    // Documents section - checkbox style (non-custom fields)
    if (field.section === 'documents' && !field.isCustom) {
      return (
        <div key={field.id} className="flex items-start space-x-3 p-4 rounded-lg border border-border">
          <Checkbox
            id={field.name}
            checked={!!value}
            onCheckedChange={(checked) => updateValue(field.name, !!checked)}
          />
          <div>
            <Label htmlFor={field.name} className="font-medium cursor-pointer">
              {field.label} {field.required && '*'}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        </div>
      );
    }

    // Gender select
    if (field.name === 'gender') {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.label} {field.required && '*'}</Label>
          <Select value={(value as string) || ''} onValueChange={(v) => updateValue(field.name, v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // MCQ custom field
    if (field.type === 'mcq' && field.options) {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.label} {field.required && '*'}</Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <RadioGroup value={(value as string) || ''} onValueChange={(v) => updateValue(field.name, v)}>
            {field.options.map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${field.name}-${opt}`} />
                <Label htmlFor={`${field.name}-${opt}`} className="cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    // Signature field
    if (field.type === 'signature') {
      return (
        <SignaturePad
          key={field.id}
          label={field.label}
          required={field.required}
          description={field.description}
          value={(value as string) || ''}
          onChange={(dataUrl) => updateValue(field.name, dataUrl)}
        />
      );
    }

    // File upload field
    if (field.type === 'file_upload') {
      return (
        <OnboardingFileUpload
          key={field.id}
          label={field.label}
          required={field.required}
          description={field.description}
          acceptedFileTypes={field.acceptedFileTypes}
          maxFileSize={field.maxFileSize}
          value={(value as string) || ''}
          onChange={(url) => updateValue(field.name, url)}
        />
      );
    }

    // Long answer
    if (field.type === 'long_answer') {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.label} {field.required && '*'}</Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
          />
        </div>
      );
    }

    // Address field - textarea
    if (field.name === 'address') {
      return (
        <div key={field.id} className="space-y-2">
          <Label>{field.label} {field.required && '*'}</Label>
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder="123 Main Street, London, SW1A 1AA"
            rows={3}
          />
        </div>
      );
    }

    // Default: text/email/tel/date input
    const inputType = field.type === 'short_answer' ? 'text' : field.type;
    return (
      <div key={field.id} className="space-y-2">
        <Label>{field.label} {field.required && '*'}</Label>
        {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
        <Input
          type={inputType}
          value={(value as string) || ''}
          onChange={(e) => updateValue(field.name, e.target.value)}
          placeholder={field.placeholder || ''}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{brandName.charAt(0)}</span>
              </div>
            )}
            <span className="font-semibold text-foreground">{brandName}</span>
            {whiteLabel && !whiteLabel.hide_powered_by && <span className="text-[10px] text-muted-foreground">Powered by AMEX Outsourcing</span>}
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div key={currentStep} initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>{isReviewStep ? 'Review Your Information' : steps[currentStep - 1]?.title}</CardTitle>
              <CardDescription>
                {isReviewStep ? 'Please verify all information is correct' : `Step ${currentStep} of ${totalSteps}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isReviewStep && getCurrentSectionFields().map(renderField)}
              {/* Honeypot - hidden from users */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <label htmlFor="hp_website">Website</label>
                <input
                  id="hp_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {isReviewStep && (
                <div className="space-y-6">
                  {activeSections.map(section => {
                    const sectionFields = enabledFields.filter(f => f.section === section);
                    const hasValues = sectionFields.some(f => {
                      const v = formValues[f.name];
                      return v !== undefined && v !== '' && v !== false;
                    });
                    if (!hasValues && section !== 'personal') return null;

                    return (
                      <div key={section} className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {sectionLabels[section]}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {sectionFields.map(f => {
                            const val = formValues[f.name];
                            if (val === '' || val === undefined || val === null) return null;
                            const isSignature = f.type === 'signature' && typeof val === 'string' && val.startsWith('data:');
                            const isFile = f.type === 'file_upload' && typeof val === 'string' && val.startsWith('http');
                            return (
                              <div key={f.id} className="contents">
                                <span className="text-muted-foreground">{f.label}:</span>
                                <span>
                                  {isSignature ? '✓ Signed' : isFile ? '✓ Uploaded' : typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* UK GDPR Consent — required on review step */}
              {isReviewStep && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Data Protection & Privacy Consent</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The information you provide will be collected and processed by {brandName} for the purpose of
                    employment registration, payroll processing, and right-to-work compliance. Your data will be
                    stored securely and retained only as long as necessary. Under the UK GDPR you have the right
                    to access, correct, or request deletion of your data at any time by contacting {brandName}.
                  </p>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="gdpr_consent"
                      checked={gdprConsent}
                      onCheckedChange={(checked) => setGdprConsent(!!checked)}
                    />
                    <label htmlFor="gdpr_consent" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I confirm that I have read and understood the above. I consent to my personal data (including
                      National Insurance number, bank details, and identification documents) being processed by{' '}
                      <span className="font-medium">{brandName}</span> for the purposes stated above. *
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>Previous</Button>
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep}>Continue</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting || !gdprConsent}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Registration
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
