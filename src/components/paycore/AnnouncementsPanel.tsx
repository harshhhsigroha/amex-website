import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Megaphone, Trash2, AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  message: string;
  target_tier: string;
  priority: string;
  is_active: boolean;
  created_by: string | null;
  expires_at: string | null;
  created_at: string;
}

const priorityConfig: Record<string, { icon: React.ElementType; class: string; label: string }> = {
  info: { icon: Info, class: 'bg-blue-500/10 text-blue-600 border-blue-500/30', label: 'Info' },
  warning: { icon: AlertTriangle, class: 'bg-amber-500/10 text-amber-600 border-amber-500/30', label: 'Warning' },
  critical: { icon: AlertCircle, class: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Critical' },
};

export function AnnouncementsPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetTier, setTargetTier] = useState('all');
  const [priority, setPriority] = useState('info');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title,
        message,
        target_tier: targetTier,
        priority,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement published');
      setOpen(false);
      setTitle('');
      setMessage('');
      setPriority('info');
      setTargetTier('all');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('announcements').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Announcements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Broadcast messages to your clients</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" />New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Message</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Details..." rows={4} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Target Tier</Label>
                  <Select value={targetTier} onValueChange={setTargetTier}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="starter">Starter Only</SelectItem>
                      <SelectItem value="growth">Growth Only</SelectItem>
                      <SelectItem value="scale">Scale Only</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => createAnnouncement.mutate()} disabled={!title || !message} className="w-full">
                <Megaphone className="h-4 w-4 mr-2" />Publish Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : announcements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => {
            const pc = priorityConfig[a.priority] || priorityConfig.info;
            const Icon = pc.icon;
            return (
              <div key={a.id} className={`p-4 rounded-xl border ${a.is_active ? '' : 'opacity-50'} ${pc.class}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      <Badge variant="outline" className="text-[9px]">{a.target_tier === 'all' ? 'All' : a.target_tier}</Badge>
                      {!a.is_active && <Badge variant="secondary" className="text-[9px]">Inactive</Badge>}
                    </div>
                    <p className="text-xs mt-1 opacity-80">{a.message}</p>
                    <p className="text-[10px] mt-2 opacity-60">{format(new Date(a.created_at), 'dd MMM yyyy HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={a.is_active} onCheckedChange={v => toggleActive.mutate({ id: a.id, active: v })} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteAnnouncement.mutate(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
