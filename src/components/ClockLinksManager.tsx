import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DbClient } from '@/types/database';
import { Clock, Copy, ExternalLink, QrCode, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ClockLinksManagerProps {
  clients: DbClient[];
}

export function ClockLinksManager({ clients }: ClockLinksManagerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getClockUrl = (clientId: string) => {
    const base = window.location.origin;
    return `${base}/clock/${clientId}`;
  };

  const handleCopy = async (clientId: string) => {
    const url = getClockUrl(clientId);
    await navigator.clipboard.writeText(url);
    setCopiedId(clientId);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = (clientId: string) => {
    window.open(getClockUrl(clientId), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Clock In / Out Links</h2>
        <p className="text-muted-foreground mt-1">
          Share these links with your workers. Anyone with the link can type their name and clock in/out.
          Hours are automatically tracked and associated with the client.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Per-Client Links
          </CardTitle>
          <CardDescription>
            Each client gets a unique clock-in link. Workers just need to enter their full name - if they're new, they'll be auto-registered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No clients yet. Add a client first.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Clock-In Link</TableHead>
                    <TableHead className="w-[140px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{client.company_name}</TableCell>
                      <TableCell>
                        <Input
                          readOnly
                          value={getClockUrl(client.id)}
                          className="font-mono text-xs bg-muted/30 max-w-md cursor-pointer"
                          onClick={() => handleCopy(client.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(client.id)}
                            title="Copy link"
                          >
                            {copiedId === client.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpen(client.id)}
                            title="Open link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-muted/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Share the link with your workers (or print it as a QR code)</li>
            <li>The worker opens the link and types their full name</li>
            <li>If they're a new worker, they're auto-registered as a candidate</li>
            <li>They tap <strong>Clock In</strong> - GPS location is captured</li>
            <li>When their shift ends, they tap <strong>Clock Out</strong></li>
            <li>All hours appear in your <strong>Timesheets</strong> tab automatically</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
