import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  candidateId: string;
  candidateName: string;
  candidateEmail: string | null;
}

export function CreateCandidateLoginDialog({ open, onOpenChange, candidateId, candidateName, candidateEmail }: Props) {
  const [email, setEmail] = useState(candidateEmail || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasLogin, setHasLogin] = useState<boolean | null>(null);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail(candidateEmail || '');
    setPassword('');
    (async () => {
      const { data } = await supabase
        .from('candidate_users')
        .select('user_id')
        .eq('candidate_id', candidateId)
        .maybeSingle();
      if (data?.user_id) {
        setHasLogin(true);
        const { data: prof } = await supabase.from('profiles').select('email').eq('id', data.user_id).maybeSingle();
        setExistingEmail(prof?.email ?? null);
      } else {
        setHasLogin(false);
        setExistingEmail(null);
      }
    })();
  }, [open, candidateId, candidateEmail]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pw + 'A1');
  };

  const handleCreate = async () => {
    if (!email.trim() || password.length < 8) {
      toast.error('Email and a password of 8+ characters with upper, lower & numbers are required');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-candidate-user', {
        body: { candidateId, email: email.trim().toLowerCase(), password, fullName: candidateName },
      });
      if (error || (data && (data as { error?: string }).error)) {
        throw new Error((data as { error?: string })?.error || error?.message || 'Failed');
      }
      toast.success('Candidate login created');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Candidate Login</DialogTitle>
          <DialogDescription>
            Create a sign-in for {candidateName} so they can view their self-billed invoices and chat with the team.
          </DialogDescription>
        </DialogHeader>

        {hasLogin === null ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Checking…</div>
        ) : hasLogin ? (
          <div className="py-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 className="h-4 w-4" /> Login already exists</div>
            <p className="text-sm text-muted-foreground">
              {existingEmail ? <>Email: <span className="font-mono">{existingEmail}</span></> : 'A login is set up for this candidate.'}
            </p>
            <p className="text-xs text-muted-foreground">
              To reset the password, ask the candidate to use “Forgot password” on the Candidate Portal sign-in page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="candidate@example.com" />
              <p className="text-[11px] text-muted-foreground">The candidate will sign in with this email.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Temporary password</Label>
              <div className="flex gap-2">
                <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 chars, with upper, lower & number" />
                <Button type="button" variant="outline" onClick={generatePassword}>Generate</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Share this password securely. They can change it later.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Login
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
