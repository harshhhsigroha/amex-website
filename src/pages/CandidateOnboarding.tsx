import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, User, CreditCard, FileCheck, Building2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { FormField, DEFAULT_FIELDS, ALL_SECTIONS, SECTIONS } from '@/components/OnboardingFormBuilder';
import { SignaturePad } from '@/components/onboarding/SignaturePad';
import { OnboardingFileUpload } from '@/components/onboarding/OnboardingFileUpload';

const fadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Map field names to DB columns
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
  const clientId = paramClientId || undefined;

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

  const brandName = 'AMEX Outsourcing';

  const activeSections = ALL_SECTIONS.filter(s => enabledFields.some(f => f.section === s));
  const totalSteps = activeSections.length + 1; // +1 for review
  const progressPercent = (currentStep / totalSteps) * 100;

  const loadConfig = useCallback(async () => {
    try {
      let data = null;

      if (clientId) {
        const res = await supabase
          .from('onboarding_form_config')
          .select('*')
          .eq('form_type', `candidate_${clientId}`)
          .maybeSingle();
        data = res.data;
      }

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
      const enabled = DEFAULT_FIELDS.filter(f => f.enabled);
      setEnabledFields(enabled);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateValue = (name: string, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const getCurrentSectionFields = () => {
    if (currentStep > activeSections.length) return [];
    const section = activeSections[currentStep - 1];
    return enabledFields.filter(f => f.section === section);
  };

  const validateStep = (): boolean => {
    if (currentStep > activeSections.length) return true;
    const sectionFields = getCurrentSectionFields();
    const missing = sectionFields.filter(f => {
      if (!f.required) return false;
      const val = formValues[f.name];
      if (typeof val === 'boolean') return false;
      return !val || (typeof val === 'string' && !val.trim());
    });

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return false;
    }

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
    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!gdprConsent) {
      toast.error('Please confirm your consent to data processing before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const firstName = ((formValues['first_name'] as string) || '').trim();
      const middleName = ((formValues['middle_name'] as string) || '').trim();
      const surname = ((formValues['candidate_name'] as string) || '').trim();
      const candidateName = [firstName, middleName, surname].filter(Boolean).join(' ');

      if (!candidateName) {
        toast.error('Name is required');
        setIsSubmitting(false);
        return;
      }

      const payload: Record<string, unknown> = {
        candidate_name: candidateName,
        _form_loaded_at: String(formLoadedAt.current),
        _hp_field: honeypot,
      };

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
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-md w-full text-center shadow-xl">
            <CardContent className="pt-12 pb-8 px-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Registration Complete!</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Thank you for registering. Our team will review your information and be in touch soon.
              </p>
              <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl">
                Back to Home
              </Button>
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
      key: s,
      title: sectionLabels[s],
      icon: sectionIcons[s],
    })),
    { key: 'review', title: 'Review & Submit', icon: CheckCircle2 },
  ];

  const isReviewStep = currentStep > activeSections.length;

  const renderField = (field: FormField) => {
    const value = formValues[field.name];

    if (field.section === 'documents' && !field.isCustom) {
      return (
        <div key={field.id} className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
          <Checkbox
            id={field.name}
            checked={!!value}
            onCheckedChange={(checked) => updateValue(field.name, !!checked)}
          />
          <div>
            <Label htmlFor={field.name} className="font-medium cursor-pointer">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{field.description}</p>
            )}
          </div>
        </div>
      );
    }

    if (field.name === 'gender') {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Select value={(value as string) || ''} onValueChange={(v) => updateValue(field.name, v)}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
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

    if (field.type === 'mcq' && field.options) {
      return (
        <div key={field.id} className="space-y-3">
          <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <RadioGroup value={(value as string) || ''} onValueChange={(v) => updateValue(field.name, v)} className="space-y-2">
            {field.options.map((opt) => (
              <div key={opt} className="flex items-center space-x-3 p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                <RadioGroupItem value={opt} id={`${field.name}-${opt}`} />
                <Label htmlFor={`${field.name}-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

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

    if (field.type === 'long_answer') {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
            className="rounded-xl"
          />
        </div>
      );
    }

    if (field.name === 'address') {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder="123 Main Street, London, SW1A 1AA"
            rows={3}
            className="rounded-xl"
          />
        </div>
      );
    }

    const inputType = field.type === 'short_answer' ? 'text' : field.type;
    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
        {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
        <Input
          type={inputType}
          value={(value as string) || ''}
          onChange={(e) => updateValue(field.name, e.target.value)}
          placeholder={field.placeholder || ''}
          className="rounded-xl"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">{brandName.charAt(0)}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{brandName}</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{formName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs">
            Back to Home
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4 gap-1 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === index + 1;
              const isComplete = currentStep > index + 1;
              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (isComplete) setCurrentStep(index + 1);
                  }}
                  className={`flex flex-col items-center gap-1.5 min-w-0 flex-1 transition-all duration-200 ${
                    isComplete ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110'
                      : isComplete
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight text-center truncate w-full ${
                    isActive ? 'text-primary font-semibold' : isComplete ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} {...fadeIn} transition={{ duration: 0.25 }}>
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const StepIcon = steps[currentStep - 1]?.icon || CheckCircle2;
                    return (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <StepIcon className="w-5 h-5 text-primary" />
                      </div>
                    );
                  })()}
                  <div>
                    <CardTitle className="text-lg">{isReviewStep ? 'Review & Submit' : steps[currentStep - 1]?.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {isReviewStep ? 'Please verify all information is correct before submitting' : `Fill in the details below to continue`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {!isReviewStep && getCurrentSectionFields().map(renderField)}

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                  <label htmlFor="hp_website">Website</label>
                  <input id="hp_website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>

                {/* Review step */}
                {isReviewStep && (
                  <div className="space-y-5">
                    {activeSections.map(section => {
                      const sectionFields = enabledFields.filter(f => f.section === section);
                      const hasValues = sectionFields.some(f => {
                        const v = formValues[f.name];
                        return v !== undefined && v !== '' && v !== false;
                      });
                      if (!hasValues && section !== 'personal') return null;

                      return (
                        <div key={section} className="rounded-xl border border-border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-foreground">
                              {sectionLabels[section]}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary h-6 px-2"
                              onClick={() => setCurrentStep(activeSections.indexOf(section) + 1)}
                            >
                              Edit
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {sectionFields.map(f => {
                              const val = formValues[f.name];
                              if (val === '' || val === undefined || val === null) return null;
                              const isSignature = f.type === 'signature' && typeof val === 'string' && val.startsWith('data:');
                              const isFile = f.type === 'file_upload' && typeof val === 'string' && val.startsWith('http');
                              return (
                                <div key={f.id} className="flex justify-between py-1 border-b border-border/30 last:border-0">
                                  <span className="text-muted-foreground text-xs">{f.label}</span>
                                  <span className="text-xs font-medium text-right ml-2">
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

                {/* GDPR consent */}
                {isReviewStep && (
                  <div className="rounded-xl border border-primary/20 p-5 bg-primary/5 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Data Protection & Privacy Consent</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The information you provide will be collected and processed by {brandName} for the purpose of
                      employment registration, payroll processing, and right-to-work compliance. Your data will be
                      stored securely and retained only as long as necessary. Under the UK GDPR you have the right
                      to access, correct, or request deletion of your data at any time by contacting {brandName}.
                    </p>
                    <div className="flex items-start gap-3 pt-1">
                      <Checkbox
                        id="gdpr_consent"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(!!checked)}
                      />
                      <label htmlFor="gdpr_consent" className="text-xs text-foreground cursor-pointer leading-relaxed">
                        I confirm that I have read and understood the above. I consent to my personal data being processed by{' '}
                        <span className="font-semibold">{brandName}</span> for the purposes stated above. <span className="text-destructive">*</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button onClick={nextStep} className="gap-2 rounded-xl">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !gdprConsent}
                      className="gap-2 rounded-xl min-w-[160px]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Submit Registration
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
