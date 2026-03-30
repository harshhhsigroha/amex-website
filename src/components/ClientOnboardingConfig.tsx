/**
 * ClientOnboardingConfig
 * Unified Onboarding tab for the Operations Portal.
 * - Shows the client-specific shareable link + QR code (white-label aware)
 * - Embeds the full form builder so operators can configure fields inline
 */
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_FIELDS, SingleFormBuilder } from '@/components/OnboardingFormBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Copy, ExternalLink, Link2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWhiteLabel } from '@/hooks/useWhiteLabel';

// ── QR Code Modal ─────────────────────────────────────────────────────────────

function QrCodeModal({
  open,
  onClose,
  url,
  brandName,
  logoUrl,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  brandName: string;
  logoUrl: string | null;
}) {
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
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-onboarding-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            {logoUrl && (
              <img src={logoUrl} alt={brandName} className="h-6 w-6 rounded object-contain" />
            )}
            <DialogTitle className="text-sm">{brandName} — Onboarding QR Code</DialogTitle>
          </div>
          <DialogDescription className="text-xs">Scan to open your candidate onboarding form</DialogDescription>
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

// ── Main component ────────────────────────────────────────────────────────────

export function ClientOnboardingConfig() {
  const { user, isAdmin } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [loadingClientId, setLoadingClientId] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allClients, setAllClients] = useState<{ id: string; company_name: string }[]>([]);

  // For admins: load all clients to pick from. For clients: resolve own client_id.
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
          setLoadingClientId(false);
        });
    } else {
      supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setClientId(data?.client_id ?? null);
          setLoadingClientId(false);
        });
    }
  }, [user, isAdmin]);

  // White-label config
  const { whiteLabel } = useWhiteLabel(clientId);

  const brandName = whiteLabel?.brand_name || 'AMEX Outsourcing';
  const logoUrl = whiteLabel?.logo_url || null;

  const onboardingUrl = clientId
    ? `${window.location.origin}/onboarding/${clientId}`
    : `${window.location.origin}/onboarding`;

  const handleCopy = () => {
    navigator.clipboard.writeText(onboardingUrl);
    setCopied(true);
    toast.success('Onboarding link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingClientId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clientId) {
    return <p className="text-sm text-muted-foreground">No clients found. Please add a client first.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Candidate Onboarding Form</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customise the form candidates fill in when onboarding. Changes apply to both direct registrations and the shared self-service link.
        </p>
      </div>

      {/* Unique shareable link — uses CSS var --primary which is already set to the white-label colour */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          {/* Header: logo + brand name + badge */}
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-8 w-8 rounded-lg object-contain border border-border/40 bg-background p-0.5 shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{brandName}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Candidate self-service onboarding link</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
              Client-specific
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Candidates registering via this link are automatically associated with{' '}
            <span className="font-medium text-foreground">{brandName}</span> only.
          </p>

          {/* URL + action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Input
              readOnly
              value={onboardingUrl}
              className="h-9 text-xs font-mono bg-background flex-1 min-w-0 border-primary/20"
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0 h-9 border-primary/20 hover:bg-primary/10 hover:text-primary"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />{copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0 h-9 border-primary/20 hover:bg-primary/10 hover:text-primary"
              onClick={() => window.open(onboardingUrl, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />Open
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0 h-9 border-primary/20 hover:bg-primary/10 hover:text-primary"
              onClick={() => setQrOpen(true)}
            >
              <QrCode className="h-3.5 w-3.5" />QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full form builder — saves as candidate_<clientId> so it's isolated per client */}
      <SingleFormBuilder
        formType={`candidate_${clientId}`}
        title="Candidate Registration"
        description="Configure the fields candidates fill in when registering with your company."
        defaultFields={DEFAULT_FIELDS}
        clientId={clientId}
      />

      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={onboardingUrl}
        brandName={brandName}
        logoUrl={logoUrl}
      />
    </div>
  );
}
