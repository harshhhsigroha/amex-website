import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useClientPlans } from '@/hooks/useAMEX OutsourcingClients';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, PlayCircle, PauseCircle, Zap, Loader2, CheckSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function BulkActionsPanel() {
  const { clients } = useClients();
  const { plans } = useClientPlans();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<string>('');
  const [running, setRunning] = useState(false);

  const toggleClient = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === clients.length) setSelected(new Set());
    else setSelected(new Set(clients.map(c => c.id)));
  };

  const executeBulk = async () => {
    if (selected.size === 0 || !action) return;
    setRunning(true);
    try {
      const ids = Array.from(selected);
      if (action === 'activate' || action === 'suspend') {
        for (const clientId of ids) {
          const plan = plans.find(p => p.client_id === clientId);
          if (plan) {
            await supabase.from('client_plans').update({ status: action === 'activate' ? 'active' : 'suspended' }).eq('id', plan.id);
          }
        }
        toast.success(`${ids.length} client(s) ${action === 'activate' ? 'activated' : 'suspended'}`);
      }
      qc.invalidateQueries({ queryKey: ['client_plans'] });
      setSelected(new Set());
      setAction('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bulk Actions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Perform actions across multiple clients at once</p>
      </div>

      {/* Action bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={selectAll} className="gap-2 text-xs">
              <CheckSquare className="h-3.5 w-3.5" />
              {selected.size === clients.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Badge variant="secondary" className="text-xs">{selected.size} selected</Badge>
            <div className="flex-1" />
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Choose action..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">
                  <span className="flex items-center gap-2"><PlayCircle className="h-3.5 w-3.5 text-emerald-500" />Activate Plans</span>
                </SelectItem>
                <SelectItem value="suspend">
                  <span className="flex items-center gap-2"><PauseCircle className="h-3.5 w-3.5 text-amber-500" />Suspend Plans</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={executeBulk} disabled={selected.size === 0 || !action || running} className="gap-2">
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Execute
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map(client => {
          const plan = plans.find(p => p.client_id === client.id);
          const isSelected = selected.has(client.id);
          return (
            <button
              key={client.id}
              onClick={() => toggleClient(client.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:bg-muted/30'
              }`}
            >
              <Checkbox checked={isSelected} className="shrink-0" />
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{client.company_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{client.city}</p>
              </div>
              {plan && (
                <Badge variant="outline" className={`text-[9px] shrink-0 ${plan.status === 'active' ? 'border-emerald-500/30 text-emerald-600' : plan.status === 'suspended' ? 'border-amber-500/30 text-amber-600' : ''}`}>
                  {plan.status}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
