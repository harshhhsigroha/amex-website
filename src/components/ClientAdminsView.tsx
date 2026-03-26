import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, Users } from 'lucide-react';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export function ClientAdminsView() {
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['paycore_admins'],
    queryFn: async () => {
      // Fetch admin user_roles joined with profiles
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (error) throw error;

      if (!roles || roles.length === 0) return [];

      const userIds = roles.map((r: { user_id: string }) => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      return roles.map((r: { user_id: string; role: string }) => ({
        id: r.user_id,
        email: profiles?.find(p => p.id === r.user_id)?.email || '',
        full_name: profiles?.find(p => p.id === r.user_id)?.full_name || null,
        role: r.role,
      })) as AdminProfile[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">AMEX Team</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your account managers and support staff at AMEX Outsourcing.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : admins.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No admins found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {(admin.full_name || admin.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {admin.full_name || 'AMEX Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  admin.role === 'super_admin'
                    ? 'border-primary/40 text-primary bg-primary/5 text-[10px]'
                    : 'text-[10px]'
                }
              >
                <Shield className="h-2.5 w-2.5 mr-1" />
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
