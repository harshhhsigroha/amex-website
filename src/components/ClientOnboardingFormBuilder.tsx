import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Copy } from 'lucide-react';
import { SingleFormBuilder, DEFAULT_FIELDS } from '@/components/OnboardingFormBuilder';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Allows a client (recruitment agency) to manage their own custom
 * candidate onboarding form, saved as form_type = "candidate_<clientId>".
 */
export function ClientOnboardingFormBuilder() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setClientId(data?.client_id ?? null);
        setLoading(false);
      });
  }, [user]);

  const onboardingUrl = `${window.location.origin}/onboarding`;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />Loading form configuration...
      </div>
    );
  }

  if (!clientId) {
    return <p className="text-sm text-muted-foreground">Unable to determine your client account.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Candidate Onboarding Form</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customise the form candidates fill in when onboarding. Changes apply to both direct registrations and the shared self-service link.
        </p>
      </div>

      {/* Shareable link */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">Candidate self-service link</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{onboardingUrl}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(onboardingUrl); toast.success('Copied'); }}>
                <Copy className="h-3.5 w-3.5" />Copy link
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => window.open(onboardingUrl, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form builder – uses client-specific form_type so it's isolated per client */}
      <SingleFormBuilder
        formType={`candidate_${clientId}`}
        title="Candidate Registration"
        description="Configure the fields candidates fill in when registering with your agency."
        defaultFields={DEFAULT_FIELDS}
        onboardingUrl={onboardingUrl}
      />
    </div>
  );
}
