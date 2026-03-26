import { Button } from '@/components/ui/button';
import { Shield, Building2, Users } from 'lucide-react';

export type LoginMode = 'team' | 'client' | 'portal';

interface AuthModeToggleProps {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex justify-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === 'team' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('team')}
        className="flex-1 text-xs px-2"
      >
        <Shield className="h-3.5 w-3.5 mr-1.5" />
        Team
      </Button>
      <Button
        variant={mode === 'client' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('client')}
        className="flex-1 text-xs px-2"
      >
        <Building2 className="h-3.5 w-3.5 mr-1.5" />
        Client
      </Button>
      <Button
        variant={mode === 'portal' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('portal')}
        className="flex-1 text-xs px-2"
      >
        <Users className="h-3.5 w-3.5 mr-1.5" />
        Portal
      </Button>
    </div>
  );
}
