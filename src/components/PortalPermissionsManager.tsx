import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, Eye, FileText, Users, BarChart3, Headphones, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface PortalPermissionsManagerProps {
  clientId: string;
}

const permissionConfig = [
  { key: 'can_view_dashboard', label: 'Dashboard', description: 'Overview stats and KPIs', icon: BarChart3 },
  { key: 'can_view_invoices', label: 'Invoices', description: 'View and download invoices', icon: FileText },
  { key: 'can_view_contractors', label: 'Contractors', description: 'View contractor listings', icon: Users },
  { key: 'can_view_support', label: 'Support Tickets', description: 'Create and manage support tickets', icon: Headphones },
  { key: 'can_view_files', label: 'Files & Documents', description: 'Access uploaded files', icon: FolderOpen },
] as const;

type PermKey = typeof permissionConfig[number]['key'];

export function PortalPermissionsManager({ clientId }: PortalPermissionsManagerProps) {
  const qc = useQueryClient();

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

  const handleToggle = (key: PermKey, value: boolean) => {
    const current = {
      can_view_dashboard: perms?.can_view_dashboard ?? true,
      can_view_invoices: perms?.can_view_invoices ?? true,
      can_view_contractors: perms?.can_view_contractors ?? true,
      can_view_support: perms?.can_view_support ?? true,
      can_view_files: perms?.can_view_files ?? false,
    };
    upsertMutation.mutate({ ...current, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        {permissionConfig.map(perm => {
          const isEnabled = perms?.[perm.key] ?? (perm.key === 'can_view_files' ? false : true);
          return (
            <div
              key={perm.key}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <perm.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer">{perm.label}</Label>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </div>
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
