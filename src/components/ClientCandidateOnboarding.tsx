import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  UserPlus, ClipboardList, ExternalLink, Copy,
} from 'lucide-react';
import { FormField, DEFAULT_FIELDS } from '@/components/OnboardingFormBuilder';
import { SignaturePad } from '@/components/onboarding/SignaturePad';
import { OnboardingFileUpload } from '@/components/onboarding/OnboardingFileUpload';
import { useAuth } from '@/contexts/AuthContext';

// ─── QR Code Modal ────────────────────────────────────────────────────────────

function QrCodeModal({ open, onClose, url }: { open: boolean; onClose: () => void; url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!open || !url) return;
    setQrReady(false);
    import('qrcode').then(QRCode => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      QRCode.toCanvas(canvas, url, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } }, err => {
        if (!err) setQrReady(true);
      });
    });
  }, [open, url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'onboarding-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Onboarding QR Code</DialogTitle>
          <DialogDescription className="text-xs">Scan to open the candidate onboarding form</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className={`rounded-xl border border-border/60 p-3 bg-white transition-opacity ${qrReady ? 'opacity-100' : 'opacity-0'}`}>
            <canvas ref={canvasRef} />
          </div>
          {!qrReady && (
            <div className="h-[304px] w-[304px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="w-full p-2 bg-muted/40 rounded-lg text-[11px] font-mono text-muted-foreground break-all text-center">{url}</div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleDownload} disabled={!qrReady}>Download PNG</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline submission form ───────────────────────────────────────────────────

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

function CandidateForm({ fields, formName }: { fields: FormField[]; formName: string }) {
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formLoadedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');

  const sections = ['personal', 'bank', 'documents', 'custom'] as const;
  const activeSections = sections.filter(s => fields.some(f => f.section === s));
  const totalSteps = activeSections.length + 1;

  useEffect(() => {
    const init: Record<string, string | boolean> = {};
    fields.forEach(f => {
      init[f.name] = f.section === 'documents' && !f.isCustom ? false : '';
    });
    setFormValues(init);
  }, [fields]);

  const updateValue = (name: string, value: string | boolean) =>
    setFormValues(prev => ({ ...prev, [name]: value }));

  const getSectionFields = (step: number) => {
    if (step > activeSections.length) return [];
    return fields.filter(f => f.section === activeSections[step - 1]);
  };

  const validateStep = () => {
    const sectionFields = getSectionFields(currentStep);
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
    return true;
  };

  const handleSubmit = async () => {
    if (honeypot) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        candidate_name: (formValues['candidate_name'] as string)?.trim() || '',
        _form_loaded_at: String(formLoadedAt.current),
        _hp_field: honeypot,
      };

      fields.forEach(f => {
        const dbCol = FIELD_TO_DB_MAP[f.name];
        if (dbCol && dbCol !== 'candidate_name') {
          const val = formValues[f.name];
          if (typeof val === 'boolean') payload[dbCol] = val;
          else if (typeof val === 'string' && val.trim()) payload[dbCol] = val.trim();
        }
      });

      if (!payload.candidate_name) {
        toast.error('Candidate name is required');
        return;
      }

      const { error } = await supabase.functions.invoke('submit-onboarding', { body: payload });
      if (error) throw error;
      setIsSubmitted(true);
      toast.success('Candidate registered successfully');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold">Candidate Registered</h3>
        <p className="text-sm text-muted-foreground max-w-sm">The candidate has been successfully registered. They'll appear in the candidates list shortly.</p>
        <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(1); const init: Record<string, string | boolean> = {}; fields.forEach(f => { init[f.name] = f.section === 'documents' && !f.isCustom ? false : ''; }); setFormValues(init); }}>
          Register Another
        </Button>
      </div>
    );
  }

  const sectionLabel: Record<string, string> = { personal: 'Personal Details', bank: 'Bank Details', documents: 'Documents', custom: 'Additional Info' };
  const isReview = currentStep > activeSections.length;
  const sectionFields = getSectionFields(currentStep);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Steps */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        {activeSections.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              i + 1 < currentStep ? 'bg-emerald-500 text-white' :
              i + 1 === currentStep ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>{i + 1}</div>
            <span className={i + 1 === currentStep ? 'text-foreground font-medium' : ''}>{sectionLabel[s]}</span>
            {i < activeSections.length - 1 && <ChevronRight className="h-3 w-3" />}
          </div>
        ))}
        <ChevronRight className="h-3 w-3" />
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isReview ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{totalSteps}</div>
        <span className={isReview ? 'text-foreground font-medium' : ''}>Review</span>
      </div>

      {/* Honeypot */}
      <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} aria-hidden />

      {/* Fields */}
      {!isReview ? (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{sectionLabel[activeSections[currentStep - 1]]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionFields.map(field => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === 'long_answer' ? (
                  <Textarea className="text-sm" value={formValues[field.name] as string || ''} onChange={e => updateValue(field.name, e.target.value)} placeholder={field.placeholder} rows={3} />
                ) : field.type === 'select' || field.type === 'mcq' ? (
                  <Select value={formValues[field.name] as string || ''} onValueChange={v => updateValue(field.name, v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={field.placeholder || 'Select...'} /></SelectTrigger>
                    <SelectContent>{field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : field.section === 'documents' && !field.isCustom ? (
                  <div className="flex items-center gap-2">
                    <Checkbox id={field.id} checked={formValues[field.name] as boolean || false} onCheckedChange={v => updateValue(field.name, v === true)} />
                    <label htmlFor={field.id} className="text-sm cursor-pointer">I confirm this document has been provided</label>
                  </div>
                ) : field.type === 'file_upload' ? (
                  <OnboardingFileUpload
                    label={field.label}
                    required={field.required}
                    description={field.description}
                    acceptedFileTypes={field.acceptedFileTypes}
                    maxFileSize={field.maxFileSize}
                    value={formValues[field.name] as string || ''}
                    onChange={url => updateValue(field.name, url)}
                  />
                ) : field.type === 'signature' ? (
                  <SignaturePad
                    label={field.label}
                    required={field.required}
                    description={field.description}
                    value={formValues[field.name] as string || ''}
                    onChange={data => updateValue(field.name, data)}
                  />
                ) : (
                  <Input className="h-9 text-sm" type={field.type} value={formValues[field.name] as string || ''} onChange={e => updateValue(field.name, e.target.value)} placeholder={field.placeholder} />
                )}
                {field.description && <p className="text-[11px] text-muted-foreground">{field.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Review Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fields.map(f => {
                const val = formValues[f.name];
                if (!val && val !== false) return null;
                return (
                  <div key={f.id} className="flex justify-between py-1.5 border-b border-border/40 text-sm">
                    <span className="text-muted-foreground text-xs">{f.label}</span>
                    <span className="font-medium text-xs text-right max-w-[60%] truncate">
                      {typeof val === 'boolean' ? (val ? '✓ Confirmed' : 'Not confirmed') : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(p => p - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />Back
          </Button>
        )}
        {!isReview ? (
          <Button size="sm" onClick={() => { if (validateStep()) setCurrentStep(p => p + 1); }}>
            Next<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Registration
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ClientCandidateOnboarding() {
  const { user, isAdmin } = useAuth();
  const [mode, setMode] = useState<'choose' | 'inline' | 'link'>('choose');
  const [fields, setFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState('Candidate Registration');
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [allClients, setAllClients] = useState<{ id: string; company_name: string }[]>([]);

  // Resolve client id - admin gets a selector, client user resolves own
  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      supabase
        .from('clients')
        .select('id, company_name')
        .is('parent_client_id', null)
        .neq('id', 'a0000000-0000-0000-0000-000000000001')
        .order('company_name')
        .then(({ data }) => {
          const clients = data || [];
          setAllClients(clients);
          if (clients.length > 0) setClientId(clients[0].id);
        });
    } else {
      supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setClientId(data?.client_id ?? null));
    }
  }, [user, isAdmin]);

  const onboardingUrl = clientId
    ? `${window.location.origin}/onboarding/${clientId}`
    : `${window.location.origin}/onboarding`;

  const loadForm = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Try client-specific form (set up via Onboarding Form builder)
      // 2. Fall back to global 'candidate' config
      // 3. Fall back to DEFAULT_FIELDS
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
          .maybeSingle();
        data = res.data;
      }

      let formFields: FormField[];
      if (data) {
        setFormName(data.form_name);
        formFields = (data.fields as unknown as FormField[]) || DEFAULT_FIELDS;
      } else {
        formFields = DEFAULT_FIELDS;
      }
      setFields(formFields.filter(f => f.enabled));
    } catch {
      setFields(DEFAULT_FIELDS.filter(f => f.enabled));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { loadForm(); }, [loadForm]);

  if (mode === 'choose') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Onboard Candidate</h2>
          <p className="text-sm text-muted-foreground mt-1">Register a new candidate directly or share the self-service link</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {/* Fill in directly */}
          <Card
            className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setMode('inline')}
          >
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Fill in on behalf</h3>
                <p className="text-xs text-muted-foreground mt-1">Complete the registration form here for the candidate</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Direct entry</Badge>
            </CardContent>
          </Card>

          {/* Share link */}
          <Card
            className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setMode('link')}
          >
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Send self-service link</h3>
                <p className="text-xs text-muted-foreground mt-1">Share a link so the candidate fills in their own details</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Self-service</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'link') {
    return (
      <div className="space-y-6 max-w-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="text-xs">← Back</Button>
          <h2 className="text-base font-bold">Share Onboarding Link</h2>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Send this link to your candidate so they can fill in their details directly:</p>
            <div className="flex gap-2 flex-wrap">
              <Input readOnly value={onboardingUrl} className="h-9 text-sm font-mono bg-muted/50 flex-1 min-w-0" />
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => { navigator.clipboard.writeText(onboardingUrl); toast.success('Link copied'); }}>
                <Copy className="h-3.5 w-3.5" />Copy
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => window.open(onboardingUrl, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />Open
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => setQrOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  <rect x="5" y="5" width="3" height="3" /><rect x="16" y="5" width="3" height="3" /><rect x="5" y="16" width="3" height="3" />
                  <line x1="14" y1="14" x2="14" y2="14" /><line x1="17" y1="14" x2="17" y2="14" /><line x1="20" y1="14" x2="20" y2="14" />
                  <line x1="14" y1="17" x2="14" y2="17" /><line x1="17" y1="17" x2="20" y2="17" /><line x1="20" y1="20" x2="14" y2="20" />
                </svg>
                QR
              </Button>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What happens next?</p>
              <ul className="space-y-1">
                <li>• The candidate fills in their personal, bank, and document details</li>
                <li>• Their record is automatically created in the Candidates database</li>
                <li>• You can view and edit their profile in the Candidates tab</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <QrCodeModal open={qrOpen} onClose={() => setQrOpen(false)} url={onboardingUrl} />
      </div>
    );
  }

  // Inline form
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setMode('choose')} className="text-xs">← Back</Button>
        <div>
          <h2 className="text-base font-bold">{formName}</h2>
          <p className="text-xs text-muted-foreground">Filling in on behalf of candidate</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />Loading form...
        </div>
      ) : (
        <CandidateForm fields={fields} formName={formName} />
      )}
    </div>
  );
}
