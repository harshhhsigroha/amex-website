import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';
import { checkRateLimit } from '@/lib/loginRateLimit';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onForgotPassword?: () => void;
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  onForgotPassword,
}: LoginFormProps) {
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    const check = () => {
      const { allowed, remainingSeconds } = checkRateLimit();
      setLockoutSeconds(allowed ? 0 : remainingSeconds);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = lockoutSeconds > 0;
  const minutes = Math.floor(lockoutSeconds / 60);
  const seconds = lockoutSeconds % 60;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isLocked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Too many failed attempts. Try again in {minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={isLocked}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          disabled={isLocked}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || isLocked}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}
