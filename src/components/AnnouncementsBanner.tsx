import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  target_tier: string;
}

const priorityStyles: Record<string, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600' },
  critical: { icon: AlertCircle, bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' },
};

export function AnnouncementsBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: announcements = [] } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, message, priority, target_tier')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const visible = announcements.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map(a => {
        const style = priorityStyles[a.priority || 'info'] || priorityStyles.info;
        const Icon = style.icon;
        return (
          <div key={a.id} className={cn('flex items-start gap-3 p-3 rounded-lg border', style.bg, style.border)}>
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', style.text)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', style.text)}>{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
            </div>
            <button onClick={() => setDismissed(prev => new Set(prev).add(a.id))} className="shrink-0 p-1 rounded hover:bg-muted">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
