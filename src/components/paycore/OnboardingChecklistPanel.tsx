import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Building2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const ONBOARDING_STEPS = [
  { key: 'plan_assigned', label: 'Plan Assigned' },
  { key: 'users_created', label: 'Admin Users Created' },
  { key: 'white_label_configured', label: 'White Label Configured' },
  { key: 'permissions_set', label: 'Permissions Configured' },
  { key: 'onboarding_form_setup', label: 'Onboarding Form Set Up' },
  { key: 'first_candidate', label: 'First Candidate Added' },
  { key: 'first_invoice', label: 'First Invoice Generated' },
  { key: 'portal_users_setup', label: 'End Users Set Up' },
];

export function OnboardingChecklistPanel() {
  const { clients } = useClients();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const { data: checklist = [], isLoading } = useQuery({
    queryKey: ['onboarding_checklist', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const { data, error } = await supabase
        .from('client_onboarding_checklist')
        .select('*')
        .eq('client_id', selectedClientId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClientId,
  });

  const initChecklist = useMutation({
    mutationFn: async () => {
      if (!selectedClientId) return;
      const rows = ONBOARDING_STEPS.map(s => ({
        client_id: selectedClientId,
        step_key: s.key,
        step_label: s.label,
      }));
      const { error } = await supabase.from('client_onboarding_checklist').upsert(rows, { onConflict: 'client_id,step_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding_checklist', selectedClientId] });
      toast.success('Checklist initialized');
    },
  });

  const toggleStep = useMutation({
    mutationFn: async ({ stepKey, completed }: { stepKey: string; completed: boolean }) => {
      const { error } = await supabase
        .from('client_onboarding_checklist')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          completed_by: completed ? user?.id : null,
        })
        .eq('client_id', selectedClientId)
        .eq('step_key', stepKey);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding_checklist', selectedClientId] }),
  });

  // Auto-detect completed steps
  const autoDetect = useMutation({
    mutationFn: async () => {
      if (!selectedClientId) return;
      const completedKeys: string[] = [];

      // Check plan
      const { data: plans } = await supabase.from('client_plans').select('id').eq('client_id', selectedClientId).limit(1);
      if (plans && plans.length > 0) completedKeys.push('plan_assigned');

      // Check users
      const { data: users } = await supabase.from('client_users').select('id').eq('client_id', selectedClientId).limit(1);
      if (users && users.length > 0) completedKeys.push('users_created');

      // Check white label
      const { data: wl } = await supabase.from('client_white_label').select('id, enabled').eq('client_id', selectedClientId).maybeSingle();
      if (wl?.enabled) completedKeys.push('white_label_configured');

      // Check permissions
      const { data: perms } = await supabase.from('client_permissions').select('id').eq('client_id', selectedClientId).limit(1);
      if (perms && perms.length > 0) completedKeys.push('permissions_set');

      // Check invoices
      const { data: inv } = await supabase.from('invoices').select('id').eq('client_id', selectedClientId).limit(1);
      if (inv && inv.length > 0) completedKeys.push('first_invoice');

      // Check portal users
      const { data: pu } = await supabase.from('portal_users').select('id').eq('client_id', selectedClientId).limit(1);
      if (pu && pu.length > 0) completedKeys.push('portal_users_setup');

      for (const key of completedKeys) {
        await supabase
          .from('client_onboarding_checklist')
          .update({ completed: true, completed_at: new Date().toISOString(), completed_by: user?.id })
          .eq('client_id', selectedClientId)
          .eq('step_key', key);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding_checklist', selectedClientId] });
      toast.success('Auto-detection complete');
    },
  });

  const completedCount = checklist.filter((c: any) => c.completed).length;
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = checklist.length > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Onboarding Checklist</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track new client setup progress</p>
        </div>
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Select client..." /></SelectTrigger>
          <SelectContent>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!selectedClientId ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select a client to view their onboarding progress</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : checklist.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No checklist for this client yet</p>
            <Button size="sm" onClick={() => initChecklist.mutate()} className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />Initialize Checklist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress bar */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{completedCount}/{totalSteps} steps complete</p>
                  <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-[10px]">{progress}%</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => autoDetect.mutate()} className="gap-2 text-xs">
                  <RefreshCw className={`h-3 w-3 ${autoDetect.isPending ? 'animate-spin' : ''}`} />Auto-detect
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-2">
            {ONBOARDING_STEPS.map(step => {
              const item = checklist.find((c: any) => c.step_key === step.key);
              const completed = item?.completed || false;
              return (
                <button
                  key={step.key}
                  onClick={() => toggleStep.mutate({ stepKey: step.key, completed: !completed })}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{step.label}</p>
                    {item?.completed_at && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Completed {format(new Date(item.completed_at), 'dd MMM yyyy HH:mm')}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
