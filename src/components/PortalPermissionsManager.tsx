/**
 * ============================================================================
 * PortalPermissionsManager
 * ============================================================================
 * Used in: ClientUserManagement
 * Purpose: Toggle portal visibility per module for a given client.
 *          Controls what end-users see in their portal dashboard.
 *
 * Reads/writes the `portal_permissions` table (one row per client).
 * If no row exists, defaults are used (all visible except Files).
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── UI Components ───────────────────────────────────────────────────────────
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, FileText, Users, BarChart3, Headphones, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

// ── Types ───────────────────────────────────────────────────────────────────
interface PortalPermissionsManagerProps {
  clientId: string;
}

// ── Permission config: defines all toggleable modules ───────────────────────
const PERMISSION_CONFIG = [
  { key: 'can_view_dashboard',   label: 'Dashboard',         description: 'Overview stats and KPIs',              icon: BarChart3,  defaultOn: true  },
  { key: 'can_view_invoices',    label: 'Invoices',           description: 'View and download invoices',           icon: FileText,   defaultOn: true  },
  { key: 'can_view_contractors', label: 'Contractors',        description: 'View contractor listings',             icon: Users,      defaultOn: true  },
  { key: 'can_view_support',     label: 'Support Tickets',    description: 'Create and manage support tickets',    icon: Headphones, defaultOn: true  },
  { key: 'can_view_files',       label: 'Files & Documents',  description: 'Access uploaded files',                icon: FolderOpen, defaultOn: false },
] as const;

type PermKey = typeof PERMISSION_CONFIG[number]['key'];

// ── Main Component ──────────────────────────────────────────────────────────
export function PortalPermissionsManager({ clientId }: PortalPermissionsManagerProps) {
  const qc = useQueryClient();

  // ── Fetch current permissions ───────────────────────────────────────────
  const { data: perms, isLoading } = useQuery({
    queryKey: ['portal_permissions', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portal_permissions')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // ── Upsert mutation (insert or update) ──────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      const payload = {
        client_id: clientId,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (perms?.id) {
        const { error } = await supabase
          .from('portal_permissions')
          .update(payload)
          .eq('id', perms.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portal_permissions')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal_permissions', clientId] });
      toast.success('Portal permissions updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Toggle handler: merges current values with the changed key ──────────
  const handleToggle = (key: PermKey, value: boolean) => {
    const current: Record<string, boolean> = {};
    for (const perm of PERMISSION_CONFIG) {
      current[perm.key] = perms?.[perm.key] ?? perm.defaultOn;
    }
    upsertMutation.mutate({ ...current, [key]: value });
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Portal Visibility
        </CardTitle>
        <CardDescription className="text-xs">
          Control what your end users can see in their portal. Changes apply immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {PERMISSION_CONFIG.map((perm) => {
          const isEnabled = perms?.[perm.key] ?? perm.defaultOn;
          return (
            <div
              key={perm.key}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <perm.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer">{perm.label}</Label>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </div>

              {/* Status badge + toggle */}
              <div className="flex items-center gap-2">
                <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-[10px]">
                  {isEnabled ? 'Visible' : 'Hidden'}
                </Badge>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(v) => handleToggle(perm.key, v)}
                  disabled={upsertMutation.isPending}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
